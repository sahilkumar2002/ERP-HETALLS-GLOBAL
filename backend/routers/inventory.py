from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Product
from auth import require_roles

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

@router.get("/")
def get_inventory(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "warehouse", "analyst"))):
    products = db.query(Product).order_by(Product.sku).all()
    return products

class StockUpdate(BaseModel):
    stock_qty: int

@router.put("/{product_id}/stock")
def update_stock(product_id: int, payload: StockUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "warehouse"))):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock_qty = payload.stock_qty
    db.commit()
    return {"message": "Stock updated successfully", "new_stock": product.stock_qty}
