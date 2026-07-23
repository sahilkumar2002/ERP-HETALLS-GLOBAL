from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Invoice, Expense
from auth import require_roles

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("/invoices")
def get_invoices(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "accountant", "analyst"))):
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    return invoices

@router.get("/expenses")
def get_expenses(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "accountant", "analyst"))):
    expenses = db.query(Expense).order_by(Expense.date.desc()).all()
    return expenses

@router.get("/bills-links")
def get_bills_links(current_user=Depends(require_roles("admin", "accountant", "analyst"))):
    import urllib.request
    import csv
    import io
    url = "https://docs.google.com/spreadsheets/d/1pMyWyI6J2YM7DzlYJ9__M8bZNaGPyrgTVAItoSiYYNg/export?format=csv&gid=2023338778&range=AI50:AO50"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            reader = csv.reader(io.StringIO(content))
            row = next(reader, [])
            return {
                "HG": row[0] if len(row) > 0 else "",
                "MMC": row[2] if len(row) > 2 else "",
                "HO": row[4] if len(row) > 4 else "",
                "MKM": row[6] if len(row) > 6 else ""
            }
    except Exception as e:
        return {"error": str(e), "HG": "", "MMC": "", "HO": "", "MKM": ""}

