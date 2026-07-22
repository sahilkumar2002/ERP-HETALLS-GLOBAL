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
