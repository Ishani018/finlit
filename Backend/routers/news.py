from fastapi import APIRouter
from typing import List, Dict
import random
from datetime import datetime
from engine.market_simulator import market_engine

router = APIRouter(prefix="/api/news", tags=["news"])

# Rich Indian-market news templates with sector impact
NEWS_EVENTS = [
    # RBI / Macro
    {"headline": "RBI holds repo rate at 6.5% — markets cheer steady stance", "sector": "Banking", "trend": 0.025},
    {"headline": "RBI cuts repo rate by 25bps — rally in banking and NBFC stocks", "sector": "Banking", "trend": 0.04},
    {"headline": "RBI raises rates to curb inflation — rate-sensitive stocks fall", "sector": "Banking", "trend": -0.035},
    {"headline": "India CPI inflation eases to 4.1% — bond yields soften", "sector": "Index", "trend": 0.02},
    {"headline": "Rupee hits record low vs USD — IT export earnings boost expected", "sector": "IT", "trend": 0.03},
    {"headline": "Rupee strengthens sharply — IT sector margins under pressure", "sector": "IT", "trend": -0.02},
    # IT sector
    {"headline": "TCS, Infosys report strong Q2 on AI-driven deal wins", "sector": "IT", "trend": 0.05},
    {"headline": "US tech layoffs raise fears of IT outsourcing cuts", "sector": "IT", "trend": -0.04},
    {"headline": "Wipro wins ₹5,000 Cr multi-year cloud transformation deal", "sector": "IT", "trend": 0.06},
    {"headline": "HCL Tech raises revenue guidance on strong order book", "sector": "IT", "trend": 0.04},
    # Banking / Finance
    {"headline": "Banking NPAs at decade low — sector re-rates higher", "sector": "Banking", "trend": 0.05},
    {"headline": "HDFC Bank Q3 PAT up 18% — analyst upgrades across board", "sector": "Banking", "trend": 0.04},
    {"headline": "SBI reports record profit on improved asset quality", "sector": "Banking", "trend": 0.05},
    {"headline": "SEBI tightens F&O rules — retail traders cautious", "sector": "Index", "trend": -0.015},
    {"headline": "Credit card defaults rise — NBFC stocks under pressure", "sector": "NBFC", "trend": -0.04},
    {"headline": "Bajaj Finance surpasses 90M customer milestone", "sector": "NBFC", "trend": 0.05},
    # Energy / Infra
    {"headline": "Crude oil spikes to $95 — inflation concerns, Reliance hedged", "sector": "Energy", "trend": -0.02},
    {"headline": "Reliance Jio announces 5G rollout in 400 cities", "sector": "Energy", "trend": 0.06},
    {"headline": "Government's ₹10L Cr infra push — L&T bags massive contracts", "sector": "Infra", "trend": 0.07},
    {"headline": "Solar panel imports tariff raised — Adani Green benefits", "sector": "Energy", "trend": 0.05},
    {"headline": "Coal shortage hits NTPC capacity — stock falls", "sector": "Energy", "trend": -0.03},
    # Auto
    {"headline": "EV sales cross 2L units — Tata Motors dominates market", "sector": "Auto", "trend": 0.07},
    {"headline": "Maruti Suzuki reports record SUV bookings for FY26", "sector": "Auto", "trend": 0.05},
    {"headline": "Semiconductor shortage disrupts auto production schedules", "sector": "Auto", "trend": -0.04},
    # Pharma / FMCG
    {"headline": "Sun Pharma US FDA approval for blockbuster oncology drug", "sector": "Pharma", "trend": 0.08},
    {"headline": "ITC Hotels demerger complete — value unlocking rally", "sector": "FMCG", "trend": 0.06},
    {"headline": "HUL faces margin pressure from palm oil price surge", "sector": "FMCG", "trend": -0.03},
    {"headline": "Good monsoon forecast boosts FMCG rural demand outlook", "sector": "FMCG", "trend": 0.04},
    # Consumer / Retail
    {"headline": "Asian Paints launches premium waterproofing range — stock up", "sector": "Consumer", "trend": 0.04},
    {"headline": "DMart Q4 revenue up 22% on festive season surge", "sector": "Consumer", "trend": 0.05},
    {"headline": "Titan jewellery division posts record quarterly sales", "sector": "Consumer", "trend": 0.05},
    {"headline": "Indian Hotels expands Taj brand to 250 properties", "sector": "Consumer", "trend": 0.04},
    # Telecom
    {"headline": "Airtel 5G subscriber base crosses 100M milestone", "sector": "Telecom", "trend": 0.06},
    {"headline": "Jio-Airtel spectrum auction drives up capex concerns", "sector": "Telecom", "trend": -0.03},
    # Macro / Index
    {"headline": "FII inflows surge — Nifty hits all-time high", "sector": "Index", "trend": 0.04},
    {"headline": "FII selling hits ₹25,000 Cr — markets bleed red", "sector": "Index", "trend": -0.05},
    {"headline": "Union Budget: LTCG exemption raised, infra spending doubled", "sector": "Index", "trend": 0.04},
    {"headline": "India GDP grows at 7.8% — Nifty surges on global investor rush", "sector": "Index", "trend": 0.05},
    {"headline": "SIP inflows cross ₹25,000 Cr for 6th consecutive month", "sector": "Index", "trend": 0.02},
    {"headline": "Small-cap index corrects 15% — panic selling or opportunity?", "sector": "Index", "trend": -0.07},
    # High-risk / Tech
    {"headline": "Adani short-seller report resurfaces — stocks plunge", "sector": "Energy", "trend": -0.09},
    {"headline": "Zomato turns cash-flow positive — stock jumps 11%", "sector": "Tech", "trend": 0.10},
    {"headline": "Swiggy rapid commerce expansion beats delivery rival", "sector": "Tech", "trend": 0.07},
    {"headline": "Paytm loses payment gateway licence — stock crashes", "sector": "Tech", "trend": -0.12},
    # Commodity / Gold
    {"headline": "Gold at ₹82,000/10g record — SGB investors cheer", "sector": "Commodity", "trend": 0.05},
    {"headline": "Global risk-off drives gold ETF inflows to 3-year high", "sector": "Commodity", "trend": 0.04},
    {"headline": "Vedanta announces special dividend of ₹20/share", "sector": "Mining", "trend": 0.08},
]

# Map news sector → simulator sector strings (used in apply_sector_shock)
NEWS_SECTOR_TO_SIM = {
    "IT":        "IT",
    "Banking":   "Banking",
    "NBFC":      "NBFC",
    "Energy":    "Energy",
    "Infra":     "Infra",
    "Auto":      "Auto",
    "Pharma":    "Pharma",
    "FMCG":      "FMCG",
    "Consumer":  "Consumer",
    "Telecom":   "Telecom",
    "Commodity": "Commodity",
    "Mining":    "Mining",
    "Tech":      "Tech",
    "Index":     None,  # affects all — apply smaller shock market-wide
}

active_news: List[Dict] = []


@router.get("/feed")
async def get_news_feed():
    return {"data": active_news}


@router.post("/generate")
async def generate_news():
    event = random.choice(NEWS_EVENTS)
    sim_sector = NEWS_SECTOR_TO_SIM.get(event["sector"])
    if sim_sector:
        market_engine.apply_sector_shock(sim_sector, event["trend"])
    else:
        # Market-wide: smaller shock to every stock
        for sym in market_engine.stocks:
            market_engine.apply_news_shock(sym, event["trend"] * 0.3)

    news_item = {
        "headline": event["headline"],
        "sector": event["sector"],
        "trend": event["trend"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    active_news.insert(0, news_item)
    if len(active_news) > 20:
        active_news.pop()
    return {"message": "News generated", "data": news_item}


@router.get("/real-feed")
async def get_real_news():
    """Returns real Indian market news fetched via yfinance."""
    from engine.real_data import fetch_real_news
    items = await fetch_real_news()
    return {"data": items}
