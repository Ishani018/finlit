from fastapi import APIRouter, HTTPException
from engine.market_simulator import market_engine

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/quotes")
async def get_all_quotes():
    return {"data": market_engine.get_all_quotes()}


@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    quote = market_engine.get_quote(symbol.upper())
    if not quote:
        raise HTTPException(status_code=404, detail="Symbol not found.")
    return {"data": quote}


@router.get("/history/{symbol}")
async def get_history(symbol: str):
    history = market_engine.get_history(symbol.upper())
    return {"data": history}


@router.get("/search/{query}")
async def search_stocks(query: str):
    query = query.lower()
    results = [q for q in market_engine.get_all_quotes()
               if query in q["symbol"].lower() or query in q["name"].lower()]
    return {"data": results}


@router.get("/seed-prices")
async def get_seed_prices():
    """
    Returns real NSE closing prices for all game stocks.
    The mobile GameContext calls this once at game start to seed its simulation.
    Falls back to current simulator prices if yfinance is unavailable.
    """
    from engine.real_data import fetch_real_prices
    real = await fetch_real_prices()
    if not real:
        # Fallback: return current simulator prices mapped by game ticker
        from engine.real_data import GAME_TO_NSE
        nse_to_game = {v: k for k, v in GAME_TO_NSE.items()}
        real = {}
        for nse_sym, stock in market_engine.stocks.items():
            game_sym = nse_to_game.get(nse_sym)
            if game_sym:
                real[game_sym] = round(stock.current_price, 2)
    return {"data": real}
