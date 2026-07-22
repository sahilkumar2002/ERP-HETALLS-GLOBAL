from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Employee
from auth import require_roles

router = APIRouter(prefix="/api/hr", tags=["hr"])

@router.get("/employees")
def get_employees(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "hr", "analyst"))):
    employees = db.query(Employee).order_by(Employee.name).all()
    return employees

class SalaryUpdate(BaseModel):
    salary: float

@router.put("/employees/{emp_id}/salary")
def update_salary(
    emp_id: int,
    payload: SalaryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin", "hr"))
):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.salary = round(payload.salary, 2)
    db.commit()
    db.refresh(emp)
    return {"message": f"Salary updated for {emp.name}", "new_salary": emp.salary}
