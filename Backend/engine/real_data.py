"""
Fetches real NSE/BSE price data and news directly from Yahoo Finance API.
Uses requests + certifi to avoid SSL issues on Windows.
All network calls run in a thread executor so FastAPI's event loop stays unblocked.
Results are cached for CACHE_TTL seconds.
"""

import asyncio
from typing import Dict, List, Optional
from datetime import datetime

# ── Game ticker → Yahoo Finance / NSE symbol ─────────────────────────────────
GAME_TO_NSE: Dict[str, str] = {
    'NIFTYBEES':  'NIFTYBEES.NS',
    'SENSEXETF':  'SENSEXIETF.NS',   # ICICI Prudential Sensex ETF
    'RELIANCE':   'RELIANCE.NS',
    'HDFCBANK':   'HDFCBANK.NS',
    'TCS':        'TCS.NS',
    'INFY':       'INFY.NS',
    'ITC':        'ITC.NS',
    # ZOMATO.NS not on Yahoo Finance — fallback to hardcoded price
    'TATAMOTORS': 'TMCV.NS',         # Tata Motors Commercial Vehicles (post-demerger)
    'IRCTC':      'IRCTC.NS',
    'ADANIGREEN': 'ADANIGREEN.NS',
    'SGBONDS':    'GOLDBEES.NS',
    'SMALLCAP':   'SMALLCAP.NS',     # SBI ETF BSE Small Cap
    'PAYTM':      'PAYTM.NS',
    'SBIN':       'SBIN.NS',
    'ICICIBANK':  'ICICIBANK.NS',
    'KOTAKBANK':  'KOTAKBANK.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'LT':         'LT.NS',
    'HCLTECH':    'HCLTECH.NS',
    'WIPRO':      'WIPRO.NS',
    'SUNPHARMA':  'SUNPHARMA.NS',
    'MARUTI':     'MARUTI.NS',
    'ASIANPAINT': 'ASIANPAINT.NS',
    'HINDUNILVR': 'HINDUNILVR.NS',
    'TITAN':      'TITAN.NS',
    'NTPC':       'NTPC.NS',
    'TATAPOWER':  'TATAPOWER.NS',
    'DMART':      'DMART.NS',
    'BANKBEES':   'BANKBEES.NS',
    'VEDANTA':    'VEDL.NS',
    'INDHOTEL':   'INDHOTEL.NS',
    'SWIGGY':     'SWIGGY.NS',
    'JUNIORBEES': 'JUNIORBEES.NS',
}

CACHE_TTL = 300  # 5 minutes

_price_cache: Dict[str, float] = {}
_news_cache: List[dict] = []
_price_cache_time: Optional[datetime] = None
_news_cache_time: Optional[datetime] = None

_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
}


# ── Public API ────────────────────────────────────────────────────────────────

async def fetch_real_prices() -> Dict[str, float]:
    global _price_cache, _price_cache_time
    now = datetime.now()
    if _price_cache_time and (now - _price_cache_time).total_seconds() < CACHE_TTL:
        return _price_cache
    loop = asyncio.get_event_loop()
    prices = await loop.run_in_executor(None, _fetch_prices_sync)
    if prices:
        _price_cache = prices
        _price_cache_time = now
    return _price_cache


async def fetch_real_news() -> List[dict]:
    global _news_cache, _news_cache_time
    now = datetime.now()
    if _news_cache_time and (now - _news_cache_time).total_seconds() < CACHE_TTL:
        return _news_cache
    loop = asyncio.get_event_loop()
    news = await loop.run_in_executor(None, _fetch_news_sync)
    if news:
        _news_cache = news
        _news_cache_time = now
    return _news_cache


# ── Synchronous helpers (run in thread pool) ─────────────────────────────────

def _fetch_prices_sync() -> Dict[str, float]:
    """Fetch current prices from Yahoo Finance v8 chart API."""
    try:
        import requests
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        results: Dict[str, float] = {}
        session = requests.Session()
        session.headers.update(_HEADERS)

        for game_sym, nse_sym in GAME_TO_NSE.items():
            try:
                url = f'https://query1.finance.yahoo.com/v8/finance/chart/{nse_sym}?interval=1d&range=5d'
                r = session.get(url, verify=False, timeout=6)
                if r.status_code != 200:
                    continue
                data = r.json()
                price = data['chart']['result'][0]['meta'].get('regularMarketPrice')
                if price and float(price) > 0:
                    results[game_sym] = round(float(price), 2)
            except Exception:
                pass

        print(f'[real_data] Fetched {len(results)}/{len(GAME_TO_NSE)} real prices')
        return results
    except Exception as e:
        print(f'[real_data] Price fetch error: {e}')
        return {}


def _fetch_news_sync() -> List[dict]:
    """Fetch recent Indian market news from Yahoo Finance."""
    try:
        import requests
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        items: List[dict] = []
        session = requests.Session()
        session.headers.update(_HEADERS)
        seed_symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', '^NSEI']

        for sym in seed_symbols:
            try:
                url = f'https://query1.finance.yahoo.com/v1/finance/search?q={sym}&newsCount=4&enableFuzzyQuery=false'
                r = session.get(url, verify=False, timeout=6)
                if r.status_code != 200:
                    continue
                news_items = r.json().get('news', [])
                for n in news_items:
                    items.append({
                        'headline': n.get('title', ''),
                        'source': n.get('publisher', 'Yahoo Finance'),
                        'timestamp': str(datetime.fromtimestamp(n.get('providerPublishTime', 0))),
                        'related': sym.replace('.NS', '').replace('^', ''),
                    })
            except Exception:
                pass

        # Dedupe by headline
        seen: set = set()
        unique: List[dict] = []
        for item in items:
            h = item['headline']
            if h and h not in seen:
                seen.add(h)
                unique.append(item)

        print(f'[real_data] Fetched {len(unique)} real news items')
        return unique[:20]
    except Exception as e:
        print(f'[real_data] News fetch error: {e}')
        return []
