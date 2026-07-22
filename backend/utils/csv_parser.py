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
        order_id = row.get('order-id') or row.get('AmazonOrderId')
        if not order_id:
            continue
            
        date_str = row.get('purchase-date') or row.get('PurchaseDate') or ''
        try:
            # Amazon dates often look like 2026-07-15T14:30:00+00:00
            order_date = datetime.fromisoformat(date_str[:19]) if date_str else datetime.utcnow()
        except Exception:
            order_date = datetime.utcnow()
            
        raw_qty = row.get('quantity-purchased') or row.get('Quantity') or '1'
        try:
            quantity = int(str(raw_qty).replace(',', ''))
        except (ValueError, TypeError):
            quantity = 1
            
        raw_price = row.get('item-price') or row.get('ItemPrice') or '0'
        try:
            amount = float(str(raw_price).replace('$', '').replace(',', ''))
        except (ValueError, TypeError):
            amount = 0.0

        orders.append({
            "order_id": str(order_id),
            "platform": "amazon",
            "customer_name": str(row.get('buyer-name') or row.get('BuyerName') or 'Amazon Customer'),
            "sku": str(row.get('sku') or row.get('SKU') or ''),
            "product_name": str(row.get('product-name') or row.get('ProductName') or 'Unknown Product'),
            "quantity": quantity,
            "amount": amount,
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
            
        raw_qty = row.get('Quantity') or '1'
        try:
            quantity = int(str(raw_qty).replace(',', ''))
        except (ValueError, TypeError):
            quantity = 1
            
        raw_price = row.get('Order Value') or '0'
        try:
            amount = float(str(raw_price).replace('$', '').replace(',', ''))
        except (ValueError, TypeError):
            amount = 0.0
            
        orders.append({
            "order_id": f"ETY-{order_id}",
            "platform": "etsy",
            "customer_name": str(row.get('Buyer') or 'Etsy Customer'),
            "sku": str(row.get('SKU') or ''),
            "product_name": str(row.get('Item Name') or 'Unknown Product'),
            "quantity": quantity,
            "amount": amount,
            "status": "processing",
            "order_date": order_date
        })
    return orders
