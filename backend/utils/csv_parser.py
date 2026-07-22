import csv
import io
from datetime import datetime

def parse_amazon_orders(csv_content: str):
    """
    Dummy parser for Amazon FBA CSV reports.
    Expected columns (mock): order-id, purchase-date, buyer-name, sku, product-name, quantity, item-price, order-status
    """
    orders = []
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t' if '\t' in csv_content[:100] else ',')
    
    for row in reader:
        # Map Amazon columns to our DB format (handling different possible column names)
        order_id = row.get('order-id', row.get('AmazonOrderId', ''))
        if not order_id:
            continue
            
        date_str = row.get('purchase-date', row.get('PurchaseDate', ''))
        try:
            # Amazon dates often look like 2026-07-15T14:30:00+00:00
            order_date = datetime.fromisoformat(date_str.split('+')[0]) if date_str else datetime.utcnow()
        except Exception:
            order_date = datetime.utcnow()
            
        orders.append({
            "order_id": order_id,
            "platform": "amazon",
            "customer_name": row.get('buyer-name', row.get('BuyerName', 'Amazon Customer')),
            "sku": row.get('sku', row.get('SKU', '')),
            "product_name": row.get('product-name', row.get('ProductName', 'Unknown Product')),
            "quantity": int(row.get('quantity-purchased', row.get('Quantity', '1'))),
            "amount": float(row.get('item-price', row.get('ItemPrice', '0')).replace('$', '') or 0),
            "status": "processing",  # Map Amazon statuses appropriately later
            "order_date": order_date
        })
    return orders

def parse_etsy_orders(csv_content: str):
    """
    Dummy parser for Etsy Order CSVs.
    Expected columns (mock): Order ID, Order Date, Buyer, SKU, Item Name, Quantity, Order Value
    """
    orders = []
    reader = csv.DictReader(io.StringIO(csv_content))
    
    for row in reader:
        order_id = row.get('Order ID')
        if not order_id:
            continue
            
        date_str = row.get('Order Date', '')
        try:
            order_date = datetime.strptime(date_str, '%m/%d/%y') if date_str else datetime.utcnow()
        except Exception:
            order_date = datetime.utcnow()
            
        orders.append({
            "order_id": f"ETY-{order_id}",
            "platform": "etsy",
            "customer_name": row.get('Buyer', 'Etsy Customer'),
            "sku": row.get('SKU', ''),
            "product_name": row.get('Item Name', 'Unknown Product'),
            "quantity": int(row.get('Quantity', '1')),
            "amount": float(row.get('Order Value', '0').replace('$', '') or 0),
            "status": "processing",
            "order_date": order_date
        })
    return orders
