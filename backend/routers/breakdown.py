from fastapi import APIRouter, Depends, Query
import urllib.request
import urllib.parse
import csv
from io import StringIO
from datetime import datetime
from auth import get_current_user

router = APIRouter(prefix="/api/breakdown", tags=["breakdown"])

SHEET_URL_TEMPLATE = "https://docs.google.com/spreadsheets/d/1SVvZnv8yphJNJp_qNKZdkB-WByslByjeRPM0_0oLQuE/gviz/tq?tqx=out:csv&sheet={}"

def fetch_sheet_csv(sheet_name):
    url = SHEET_URL_TEMPLATE.format(urllib.parse.quote(sheet_name))
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            return list(csv.reader(StringIO(content)))
    except Exception as e:
        print(f"Error fetching sheet {sheet_name}: {e}")
        return []

@router.get("/daily-sales")
def daily_sales(date: str = Query(default="today"), current_user=Depends(get_current_user)):
    """
    Fetch daily sales data from 'DAILY SALE BRANDS N PORTAL' sheet.
    date param: 'today', 'all', or 'YYYY-MM-DD' for a specific date.
    """
    data = fetch_sheet_csv("DAILY SALE BRANDS N PORTAL")
    
    if not data or len(data) < 3:
        return {"headers": [], "sub_headers": [], "rows": []}
    
    # Row 0 = headers (merged cells / main headings)
    # Row 1 = sub-headers (individual column names)
    # Row 2+ = data rows
    raw_headers = data[0] if len(data) > 0 else []
    sub_headers = data[1] if len(data) > 1 else []
    
    # Fill forward headers (merged cells appear as empty in CSV)
    headers = []
    last_header = ""
    for h in raw_headers:
        if h.strip():
            last_header = h.strip()
        headers.append(last_header)
    
    # Determine target date for filtering
    now = datetime.utcnow()
    target_date = None
    filter_all = False
    
    if date == "all":
        filter_all = True
    elif date == "today":
        target_date = now.strftime("%d-%b-%Y")  # e.g. "23-Jul-2026"
    else:
        # Expect YYYY-MM-DD format, convert to sheet format
        try:
            dt = datetime.strptime(date, "%Y-%m-%d")
            target_date = dt.strftime("%-d-%b-%Y")  # e.g. "1-Nov-2025"
        except ValueError:
            # Try Windows-compatible format
            try:
                dt = datetime.strptime(date, "%Y-%m-%d")
                target_date = f"{dt.day}-{dt.strftime('%b')}-{dt.year}"
            except ValueError:
                target_date = date
    
    rows = []
    for row in data[2:]:  # Skip header rows
        if not row or not any(cell.strip() for cell in row):
            continue
        
        # Column A (index 0) is the date column
        row_date = row[0].strip() if len(row) > 0 else ""
        
        if not filter_all and target_date:
            # Try to match date
            try:
                row_dt = datetime.strptime(row_date, "%d-%b-%Y")
                if date == "today":
                    if row_dt.date() != now.date():
                        continue
                else:
                    target_dt = datetime.strptime(date, "%Y-%m-%d")
                    if row_dt.date() != target_dt.date():
                        continue
            except ValueError:
                continue
        
        rows.append(row)
    
    return {
        "headers": headers,
        "sub_headers": [s.strip() for s in sub_headers],
        "rows": rows,
        "total_rows": len(rows),
    }
