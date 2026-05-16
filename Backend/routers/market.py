from fastapi import APIRouter, HTTPException
from engine.market_simulator import market_engine

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/quotes")
async def get_all_quotes():
    """Returns the current quote for all simulated stocks."""
    return {"data": market_engine.get_all_quotes()}

@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    """Returns the current quote for a specific simulated stock."""
    quote = market_engine.get_quote(symbol.upper())
    if not quote:
        raise HTTPException(status_code=404, detail="Symbol not found in simulation.")
    return {"data": quote}

@router.get("/history/{symbol}")
async def get_history(symbol: str):
    """Returns the generated OHLC history for a specific stock."""
    history = market_engine.get_history(symbol.upper())
    return {"data": history}

@router.get("/search/{query}")
async def search_stocks(query: str):
    """Searches for stocks matching the query."""
    query = query.lower()
    results = []
    for quote in market_engine.get_all_quotes():
        if query in quote["symbol"].lower() or query in quote["name"].lower():
            results.append(quote)
    return {"data": results}
