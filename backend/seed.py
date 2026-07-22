"""
Seed the database with realistic sample data for the Rugs ERP demo.
Run once: python seed.py
"""
from database import SessionLocal, create_tables, User, Order, Product, Invoice, Expense, Employee
from auth import hash_password
from datetime import datetime, timedelta
import random

def seed():
    create_tables()
    db = SessionLocal()

    # ── Companies ─────────────────────────────────────────────────────────────
    companies = ["Hetalls Global", "MKM", "Hetalls", "MMC", "Eastern"]

    # ── Users ─────────────────────────────────────────────────────────────────
    users = [
        {"name": "Admin User",      "email": "admin@rugsco.com",      "password": "admin123",  "role": "admin",       "department": "IT"},
        {"name": "Sara Accounts",   "email": "sara@rugsco.com",       "password": "pass123",   "role": "accountant",  "department": "Accounts"},
        {"name": "Mike Ecommerce",  "email": "mike@rugsco.com",       "password": "pass123",   "role": "ecommerce",   "department": "E-Commerce"},
        {"name": "Jane Warehouse",  "email": "jane@rugsco.com",       "password": "pass123",   "role": "warehouse",   "department": "Inventory"},
        {"name": "Tom HR",          "email": "tom@rugsco.com",        "password": "pass123",   "role": "hr",          "department": "HR"},
        {"name": "Ali Analyst",     "email": "ali@rugsco.com",        "password": "pass123",   "role": "analyst",     "department": "IT"},
    ]
    for u in users:
        if not db.query(User).filter(User.email == u["email"]).first():
            db.add(User(name=u["name"], email=u["email"], hashed_password=hash_password(u["password"]),
                        role=u["role"], department=u["department"]))

    # ── Products ──────────────────────────────────────────────────────────────
    rugs = [
        ("RG-001", "Persian Garden 5x8",    "Traditional", "5x8 ft",  "Ivory & Blue",  "Wool",      45, 189, 34),
        ("RG-002", "Moroccan Boho 4x6",     "Boho",        "4x6 ft",  "Multi",         "Cotton",    28, 129, 52),
        ("RG-003", "Modern Geometric 8x10", "Modern",      "8x10 ft", "Grey & White",  "Polyester", 68, 279, 8),
        ("RG-004", "Vintage Kilim 3x5",     "Vintage",     "3x5 ft",  "Red & Tan",     "Wool",      22,  99, 61),
        ("RG-005", "Shag Luxury 6x9",       "Contemporary","6x9 ft",  "Cream",         "Faux Fur",  85, 349, 5),
        ("RG-006", "Outdoor Stripe 5x7",    "Outdoor",     "5x7 ft",  "Navy & White",  "Polyprop",  18,  89, 29),
        ("RG-007", "Oriental Medallion 9x12","Traditional","9x12 ft", "Burgundy & Gold","Wool",    110, 459, 12),
        ("RG-008", "Flatweave Tribal 4x6",  "Boho",        "4x6 ft",  "Terracotta",    "Cotton",    25, 109, 47),
    ]
    for sku, name, cat, size, color, mat, cost, sell, stock in rugs:
        if not db.query(Product).filter(Product.sku == sku).first():
            db.add(Product(sku=sku, name=name, category=cat, size=size, color=color,
                           material=mat, cost_price=cost, sell_price=sell, stock_qty=stock,
                           reorder_level=10, location="FBA", company=random.choice(companies)))

    # ── Orders ────────────────────────────────────────────────────────────────
    platforms   = ["amazon", "etsy"]
    statuses    = ["pending", "processing", "shipped", "delivered", "returned"]
    stat_weights= [0.1, 0.15, 0.2, 0.5, 0.05]
    customers   = ["James Wilson", "Emma Davis", "Liam Brown", "Olivia Taylor",
                   "Noah Martinez", "Sophia Anderson", "Ethan Thomas", "Ava Jackson",
                   "Mason White", "Isabella Harris"]

    for i in range(1, 201):
        rug = random.choice(rugs)
        days_ago = random.randint(0, 180)
        order_date = datetime.utcnow() - timedelta(days=days_ago)
        qty = random.randint(1, 3)
        platform = random.choice(platforms)
        oid = f"{'AMZ' if platform=='amazon' else 'ETY'}-{10000 + i}"
        status = random.choices(statuses, stat_weights)[0]
        if not db.query(Order).filter(Order.order_id == oid).first():
            db.add(Order(order_id=oid, platform=platform,
                         customer_name=random.choice(customers),
                         product_name=rug[1], sku=rug[0],
                         quantity=qty, amount=round(rug[7] * qty, 2),
                         status=status, order_date=order_date, company=random.choice(companies)))

    # ── Invoices ──────────────────────────────────────────────────────────────
    inv_statuses = ["paid", "pending", "overdue"]
    clients = ["Wholesale Decor LLC", "HomeGoods Direct", "Rugs & Beyond", "Interior Depot"]
    for i in range(1, 21):
        inv_no = f"INV-{2026001 + i}"
        amount = round(random.uniform(500, 5000), 2)
        tax    = round(amount * 0.08, 2)
        total  = round(amount + tax, 2)
        due    = datetime.utcnow() + timedelta(days=random.randint(-30, 60))
        status = random.choice(inv_statuses)
        if not db.query(Invoice).filter(Invoice.invoice_no == inv_no).first():
            db.add(Invoice(invoice_no=inv_no, client_name=random.choice(clients),
                           amount=amount, tax=tax, total=total,
                           status=status, due_date=due, company=random.choice(companies)))

    # ── Expenses ──────────────────────────────────────────────────────────────
    exp_categories = ["Shipping", "Packaging", "Amazon Fees", "Etsy Fees", "Marketing", "Utilities", "Payroll"]
    for i in range(30):
        db.add(Expense(title=f"{random.choice(exp_categories)} expense",
                       category=random.choice(exp_categories),
                       amount=round(random.uniform(50, 2000), 2),
                       date=datetime.utcnow() - timedelta(days=random.randint(0, 90)),
                       company=random.choice(companies)))

    # ── Employees ─────────────────────────────────────────────────────────────
    departments = ["Accounts", "E-Commerce", "IT", "HR", "Inventory", "Marketing"]
    emp_roles   = ["Manager", "Senior Staff", "Staff", "Analyst", "Coordinator"]
    first_names = ["Sarah","John","Emily","David","Lisa","Mark","Anna","Chris","Kate","Paul",
                   "Amy","James","Nina","Tom","Zara","Ryan","Mia","Luke","Eva","Ben"]
    last_names  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis"]

    for i in range(30):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        email = f"{fname.lower()}.{lname.lower()}{i}@rugsco.com"
        if not db.query(Employee).filter(Employee.email == email).first():
            db.add(Employee(name=f"{fname} {lname}", email=email,
                            department=random.choice(departments),
                            role=random.choice(emp_roles),
                            salary=round(random.uniform(2800, 8500), 2),
                            join_date=datetime.utcnow() - timedelta(days=random.randint(30, 1000)),
                            company=random.choice(companies)))

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
