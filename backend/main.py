from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routers import auth, dashboard, users, orders, inventory, accounts, hr, reports, payroll

app = FastAPI(title="Rugs ERP API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables on startup
create_tables()

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(accounts.router)
app.include_router(hr.router)
app.include_router(reports.router)
app.include_router(payroll.router)

@app.get("/")
def root():
    return {"message": "Rugs ERP API is running", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
