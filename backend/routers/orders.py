from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Order
from auth import require_roles
from utils.csv_parser import parse_amazon_orders, parse_etsy_orders

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("/")
def get_orders(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "ecommerce", "analyst"))):
    orders = db.query(Order).order_by(Order.order_date.desc()).all()
    return orders

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    platform: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin", "ecommerce"))
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Only CSV/TXT files allowed")
        
    content = await file.read()
    content_str = content.decode('utf-8', errors='ignore')
    
    if platform == 'amazon':
        parsed_orders = parse_amazon_orders(content_str)
    elif platform == 'etsy':
        parsed_orders = parse_etsy_orders(content_str)
    else:
        raise HTTPException(status_code=400, detail="Invalid platform")
        
    inserted = 0
    seen_ids = set()
    for o_data in parsed_orders:
        oid = o_data['order_id']
        if oid in seen_ids:
            continue
        seen_ids.add(oid)
        
        # Check if exists
        existing = db.query(Order).filter(Order.order_id == oid).first()
        if not existing:
            new_order = Order(**o_data)
            db.add(new_order)
            inserted += 1
            
    db.commit()
    return {"message": f"Successfully imported {inserted} new orders out of {len(parsed_orders)} total rows.", "inserted": inserted}
