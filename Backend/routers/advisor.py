from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from engine.market_simulator import market_engine
from db import get_db

router = APIRouter(prefix="/api/advisor", tags=["advisor"])

class SubscribeRequest(BaseModel):
    user_id: int

@router.post("/subscribe")
async def subscribe_ca(req: SubscribeRequest):
    fee = 5000.0
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT balance, is_ca_subscribed FROM users WHERE id = ?", (req.user_id,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(404, "User not found")
        if user["is_ca_subscribed"]:
            return {"message": "Already subscribed", "balance": user["balance"]}
        if user["balance"] < fee:
            raise HTTPException(400, "Insufficient funds to hire CA")
            
        new_balance = user["balance"] - fee
        cursor.execute("UPDATE users SET balance = ?, is_ca_subscribed = 1 WHERE id = ?", (new_balance, req.user_id))
        conn.commit()
        
    return {"message": "CA Hired Successfully!", "balance": new_balance}

@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT is_ca_subscribed FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user or not user["is_ca_subscribed"]:
            raise HTTPException(403, "Must hire CA to access this feature")
            
    # Simple advice algorithm: Find stocks that are down from previous close (buy the dip)
    quotes = market_engine.get_all_quotes()
    down_stocks = [q for q in quotes if q["change_percent"] < 0]
    
    # Sort by biggest losers
    down_stocks.sort(key=lambda x: x["change_percent"])
    
    recommendations = []
    for stock in down_stocks[:2]:
        recommendations.append({
            "symbol": stock["symbol"],
            "name": stock["name"],
            "advice": "STRONG BUY",
            "reason": f"{stock['name']} is currently down by {stock['change_percent']}%. Based on our charts, this is a great dip-buying opportunity."
        })
        
    if not recommendations and quotes:
        recommendations.append({
            "symbol": quotes[0]["symbol"],
            "name": quotes[0]["name"],
            "advice": "HOLD",
            "reason": "Market is currently stable. Hold your positions."
        })
        
    return {"data": recommendations}
