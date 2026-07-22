from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db, Order, Product, Invoice, Employee
from auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    now   = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_revenue = db.query(func.sum(Order.amount)).filter(
        Order.status != "returned"
    ).scalar() or 0

    monthly_revenue = db.query(func.sum(Order.amount)).filter(
        Order.order_date >= month_start,
        Order.status != "returned"
    ).scalar() or 0

    total_orders   = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0
    low_stock      = db.query(func.count(Product.id)).filter(
        Product.stock_qty <= Product.reorder_level, Product.is_active == True
    ).scalar() or 0
    pending_invoices = db.query(func.sum(Invoice.total)).filter(Invoice.status == "pending").scalar() or 0
    overdue_invoices = db.query(func.count(Invoice.id)).filter(Invoice.status == "overdue").scalar() or 0
    total_employees  = db.query(func.count(Employee.id)).filter(Employee.is_active == True).scalar() or 0

    return {
        "total_revenue":     round(total_revenue, 2),
        "monthly_revenue":   round(monthly_revenue, 2),
        "total_orders":      total_orders,
        "pending_orders":    pending_orders,
        "low_stock_alerts":  low_stock,
        "pending_invoices":  round(pending_invoices, 2),
        "overdue_invoices":  overdue_invoices,
        "total_employees":   total_employees,
    }

@router.get("/revenue-chart")
def revenue_chart(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Last 6 months revenue split by platform."""
    results = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_date  = now - timedelta(days=i * 30)
        month_label = month_date.strftime("%b %Y")
        y, m        = month_date.year, month_date.month

        amazon = db.query(func.sum(Order.amount)).filter(
            Order.platform == "amazon",
            extract("year",  Order.order_date) == y,
            extract("month", Order.order_date) == m,
            Order.status != "returned"
        ).scalar() or 0

        etsy = db.query(func.sum(Order.amount)).filter(
            Order.platform == "etsy",
            extract("year",  Order.order_date) == y,
            extract("month", Order.order_date) == m,
            Order.status != "returned"
        ).scalar() or 0

        results.append({"month": month_label, "amazon": round(amazon, 2), "etsy": round(etsy, 2)})

    return results

@router.get("/recent-orders")
def recent_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(8).all()
    return [
        {
            "id":            o.id,
            "order_id":      o.order_id,
            "platform":      o.platform,
            "customer_name": o.customer_name,
            "product_name":  o.product_name,
            "amount":        o.amount,
            "status":        o.status,
            "order_date":    o.order_date.isoformat() if o.order_date else None,
        }
        for o in orders
    ]

@router.get("/platform-split")
def platform_split(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    amazon = db.query(func.sum(Order.amount)).filter(Order.platform == "amazon", Order.status != "returned").scalar() or 0
    etsy   = db.query(func.sum(Order.amount)).filter(Order.platform == "etsy",   Order.status != "returned").scalar() or 0
    return [
        {"name": "Amazon FBA", "value": round(amazon, 2), "color": "#f59e0b"},
        {"name": "Etsy",       "value": round(etsy,   2), "color": "#d97706"},
    ]
