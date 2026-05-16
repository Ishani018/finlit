from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
from engine.market_simulator import market_engine
from db import get_db

router = APIRouter(prefix="/api/trade", tags=["trading"])

class TradeRequest(BaseModel):
    user_id: int
    symbol: str
    quantity: int

@router.post("/buy")
async def buy_stock(req: TradeRequest):
    quote = market_engine.get_quote(req.symbol)
    if not quote:
        raise HTTPException(404, "Stock not found")
        
    price = quote['price']
    total_cost = price * req.quantity
    
    with get_db() as conn:
        cursor = conn.cursor()
        # Check balance
        cursor.execute("SELECT balance FROM users WHERE id = ?", (req.user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(404, "User not found")
            
        balance = user_row['balance']
        if balance < total_cost:
            raise HTTPException(400, "Insufficient funds")
            
        # Deduct balance
        new_balance = balance - total_cost
        cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, req.user_id))
        
        # Log transaction
        cursor.execute("INSERT INTO transactions (user_id, symbol, transaction_type, quantity, price) VALUES (?, ?, ?, ?, ?)",
                       (req.user_id, req.symbol, 'BUY', req.quantity, price))
                       
        # Update holdings
        cursor.execute("SELECT * FROM holdings WHERE user_id = ? AND symbol = ?", (req.user_id, req.symbol))
        holding = cursor.fetchone()
        
        if holding:
            new_qty = holding['quantity'] + req.quantity
            total_spent_before = holding['quantity'] * holding['average_price']
            new_avg_price = (total_spent_before + total_cost) / new_qty
            cursor.execute("UPDATE holdings SET quantity = ?, average_price = ? WHERE id = ?", 
                           (new_qty, new_avg_price, holding['id']))
        else:
            cursor.execute("INSERT INTO holdings (user_id, symbol, quantity, average_price) VALUES (?, ?, ?, ?)",
                           (req.user_id, req.symbol, req.quantity, price))
                           
        conn.commit()
    return {"message": "Success", "balance": new_balance}

@router.post("/sell")
async def sell_stock(req: TradeRequest):
    quote = market_engine.get_quote(req.symbol)
    if not quote:
        raise HTTPException(404, "Stock not found")
        
    price = quote['price']
    total_revenue = price * req.quantity
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check holdings
        cursor.execute("SELECT * FROM holdings WHERE user_id = ? AND symbol = ?", (req.user_id, req.symbol))
        holding = cursor.fetchone()
        
        if not holding or holding['quantity'] < req.quantity:
            raise HTTPException(400, "Insufficient shares")
            
        # Update holdings
        new_qty = holding['quantity'] - req.quantity
        if new_qty == 0:
            cursor.execute("DELETE FROM holdings WHERE id = ?", (holding['id'],))
        else:
            cursor.execute("UPDATE holdings SET quantity = ? WHERE id = ?", (new_qty, holding['id']))
            
        # Add to balance
        cursor.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (total_revenue, req.user_id))
        
        # Log transaction
        cursor.execute("INSERT INTO transactions (user_id, symbol, transaction_type, quantity, price) VALUES (?, ?, ?, ?, ?)",
                       (req.user_id, req.symbol, 'SELL', req.quantity, price))
                       
        conn.commit()
        
    return {"message": "Success", "revenue": total_revenue}

@router.get("/portfolio/{user_id}")
async def get_portfolio(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT balance FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(404, "User not found")
            
        balance = user_row['balance']
        
        cursor.execute("SELECT symbol, quantity, average_price FROM holdings WHERE user_id = ?", (user_id,))
        holdings_rows = cursor.fetchall()
        
    holdings = []
    total_invested = 0.0
    current_value = 0.0
    
    for row in holdings_rows:
        symbol = row['symbol']
        qty = row['quantity']
        avg_price = row['average_price']
        
        invested = qty * avg_price
        total_invested += invested
        
        quote = market_engine.get_quote(symbol)
        curr_price = dict(quote).get('price', 0.0) if quote else 0.0
        val = qty * curr_price
        current_value += val
        
        holdings.append({
            "symbol": symbol,
            "quantity": qty,
            "average_price": round(avg_price, 2),
            "current_price": round(curr_price, 2),
            "invested_value": round(invested, 2),
            "current_value": round(val, 2),
            "pnl": round(val - invested, 2),
            "pnl_percent": round(((val - invested) / invested * 100) if invested else 0, 2)
        })
        
    return {
        "balance": round(balance, 2),
        "total_invested": round(total_invested, 2),
        "current_value": round(current_value, 2),
        "total_pnl": round(current_value - total_invested, 2),
        "holdings": holdings
    }

@router.get("/orders/{user_id}")
async def get_orders(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT symbol, transaction_type, quantity, price, timestamp FROM transactions WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
        # Convert sqlite3.Row to dict
        orders = [dict(row) for row in cursor.fetchall()]
        
    return {"data": orders}
