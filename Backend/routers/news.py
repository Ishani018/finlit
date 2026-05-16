from fastapi import APIRouter
from typing import List, Dict
import random
from engine.market_simulator import market_engine

router = APIRouter(prefix="/api/news", tags=["news"])

# Mock news events
NEWS_EVENTS = [
    {"headline": "Tech Sector Booms on AI Advancements!", "trend": 0.05, "sector": "TECH"},
    {"headline": "Financial Regulations Tighten, Banks Brace for Impact.", "trend": -0.04, "sector": "FINANCE"},
    {"headline": "Automobile Sales Hit Record High This Quarter.", "trend": 0.03, "sector": "AUTO"},
    {"headline": "Pharma Company Announces Breakthrough Drug.", "trend": 0.06, "sector": "PHARMA"},
    {"headline": "Energy Crisis Slows Down Industrial Growth.", "trend": -0.02, "sector": "ENERGY"},
    {"headline": "Infrastructure Push Leads To Construction Boom.", "trend": 0.04, "sector": "INFRA"}
]

# Map mock stocks to sectors
SECTORS = {
    "TCS.NS": "TECH", "INFY.NS": "TECH", 
    "HDFCBANK.NS": "FINANCE", "ICICIBANK.NS": "FINANCE", "SBI.NS": "FINANCE", "BAJFINANCE.NS": "FINANCE",
    "TATAMOTORS.NS": "AUTO", "M&M.NS": "AUTO",
    "SUNPHARMA.NS": "PHARMA",
    "RELIANCE.NS": "ENERGY", "NTPC.NS": "ENERGY",
    "LT.NS": "INFRA"
}

active_news = []

@router.get("/feed")
async def get_news_feed():
    """Returns the latest news feed."""
    return {"data": active_news}

@router.post("/generate")
async def generate_news():
    """Generates a random news event and applies the shock to the market engine."""
    event = random.choice(NEWS_EVENTS)
    
    # Apply shock to all stocks in sector
    affected_symbols = []
    for symbol, sector in SECTORS.items():
        if sector == event["sector"]:
            market_engine.apply_news_shock(symbol, event["trend"])
            affected_symbols.append(symbol)
            
    from datetime import datetime
    news_item = {
        "headline": event["headline"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "affected_stocks": affected_symbols
    }
    active_news.insert(0, news_item)
    if len(active_news) > 20: # keep last 20
        active_news.pop()
        
    return {"message": "News generated", "data": news_item}
