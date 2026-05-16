import asyncio
import random
from typing import Dict, List
from datetime import datetime

class Stock:
    def __init__(self, symbol: str, name: str, initial_price: float, sector: str = 'General'):
        self.symbol = symbol
        self.name = name
        self.sector = sector
        self.current_price = initial_price
        self.previous_close = max(1.0, initial_price * (1 + random.uniform(-0.02, 0.02)))
        self.history: List[Dict] = []

        self._current_open = initial_price
        self._current_high = initial_price
        self._current_low = initial_price
        self._last_candle_time = datetime.now()

        self.volatility = 0.002
        self.trend = 0.0
        self._base_price = initial_price  # for mean reversion

    def tick(self, sector_bias: float = 0.0):
        """Gaussian random walk + sector correlation + mild mean reversion."""
        # Gaussian via Box-Muller
        u1, u2 = max(1e-10, random.random()), random.random()
        import math
        gaussian = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        stock_noise = gaussian * self.volatility

        # Sector-wide swing (shared across stocks in same sector)
        combined = self.trend + sector_bias * 0.5 + stock_noise

        # Mild mean reversion toward base price (prevents extreme drift)
        deviation = (self.current_price - self._base_price) / self._base_price
        reversion = -deviation * 0.002

        change_pct = combined + reversion
        new_price = self.current_price * (1 + change_pct)
        self.current_price = max(1.0, round(new_price, 2))

        self._current_high = max(self._current_high, self.current_price)
        self._current_low = min(self._current_low, self.current_price)

        now = datetime.now()
        if (now - self._last_candle_time).total_seconds() >= 60:
            self.history.append({
                "time": self._last_candle_time.isoformat(),
                "open": self._current_open,
                "high": self._current_high,
                "low": self._current_low,
                "close": self.current_price,
            })
            if len(self.history) > 100:
                self.history.pop(0)
            self._current_open = self.current_price
            self._current_high = self.current_price
            self._current_low = self.current_price
            self._last_candle_time = now

        self.trend *= 0.95

    def seed_price(self, real_price: float):
        """Update price from live market data."""
        self.current_price = real_price
        self.previous_close = real_price * (1 + random.uniform(-0.01, 0.01))
        self._base_price = real_price
        self._current_open = real_price
        self._current_high = real_price
        self._current_low = real_price

    def get_quote(self):
        change = self.current_price - self.previous_close
        pct = (change / self.previous_close * 100) if self.previous_close else 0
        return {
            "symbol": self.symbol,
            "name": self.name,
            "sector": self.sector,
            "price": self.current_price,
            "change": round(change, 2),
            "change_percent": round(pct, 2),
            "previous_close": round(self.previous_close, 2),
        }


# Sector groupings for correlated movement
SECTOR_GROUPS: Dict[str, List[str]] = {
    'IT':          ['TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS'],
    'Banking':     ['HDFCBANK.NS', 'SBIN.NS', 'ICICIBANK.NS', 'KOTAKBANK.NS'],
    'NBFC':        ['BAJFINANCE.NS'],
    'Energy':      ['RELIANCE.NS', 'NTPC.NS', 'TATAPOWER.NS', 'ADANIGREEN.NS'],
    'Auto':        ['TATAMOTORS.NS', 'MARUTI.NS'],
    'Pharma':      ['SUNPHARMA.NS'],
    'FMCG':        ['ITC.NS', 'HINDUNILVR.NS'],
    'Consumer':    ['TITAN.NS', 'DMART.NS', 'ASIANPAINT.NS', 'INDHOTEL.NS'],
    'Telecom':     ['BHARTIARTL.NS'],
    'Infra':       ['LT.NS'],
    'PSU':         ['IRCTC.NS', 'NTPC.NS', 'SBIN.NS'],
    'Index':       ['NIFTYBEES.NS', 'SENSEXBEES.NS', 'BANKBEES.NS', 'JUNIORBEES.NS', 'SETFSMALL.NS'],
    'Commodity':   ['GOLDBEES.NS'],
    'Tech':        ['ZOMATO.NS', 'PAYTM.NS', 'SWIGGY.NS'],
    'Mining':      ['VEDL.NS'],
}


class MarketSimulator:
    def __init__(self):
        self.stocks: Dict[str, Stock] = {}
        self.is_running = False
        self._initialize_stocks()

    def _initialize_stocks(self):
        # Using realistic May 2025 approximate prices
        initial_data = [
            # Indices / ETFs
            ("NIFTYBEES.NS",  "Nifty 50 BeES ETF",        245.0,   'Index'),
            ("SENSEXBEES.NS", "Sensex BeES ETF",           770.0,   'Index'),
            ("BANKBEES.NS",   "Bank Nifty BeES ETF",       510.0,   'Index'),
            ("JUNIORBEES.NS", "Nifty Next 50 BeES ETF",    82.0,    'Index'),
            ("SETFSMALL.NS",  "SBI ETF BSE Small Cap",     88.0,    'Index'),
            # Large Cap — IT
            ("TCS.NS",        "TCS",                       3750.0,  'IT'),
            ("INFY.NS",       "Infosys",                   1480.0,  'IT'),
            ("HCLTECH.NS",    "HCL Technologies",          1660.0,  'IT'),
            ("WIPRO.NS",      "Wipro",                     255.0,   'IT'),
            # Large Cap — Banking / Finance
            ("HDFCBANK.NS",   "HDFC Bank",                 1720.0,  'Banking'),
            ("SBIN.NS",       "State Bank of India",       800.0,   'Banking'),
            ("ICICIBANK.NS",  "ICICI Bank",                1220.0,  'Banking'),
            ("KOTAKBANK.NS",  "Kotak Mahindra Bank",       2150.0,  'Banking'),
            ("BAJFINANCE.NS", "Bajaj Finance",             9100.0,  'NBFC'),
            # Large Cap — Energy / Infra
            ("RELIANCE.NS",   "Reliance Industries",       1290.0,  'Energy'),
            ("NTPC.NS",       "NTPC",                      370.0,   'Energy'),
            ("TATAPOWER.NS",  "Tata Power",                430.0,   'Energy'),
            ("ADANIGREEN.NS", "Adani Green Energy",        1060.0,  'Energy'),
            ("LT.NS",         "Larsen & Toubro",           3650.0,  'Infra'),
            # Large Cap — Auto
            ("TATAMOTORS.NS", "Tata Motors",               660.0,   'Auto'),
            ("MARUTI.NS",     "Maruti Suzuki",             12400.0, 'Auto'),
            # Large Cap — Pharma / FMCG / Consumer
            ("SUNPHARMA.NS",  "Sun Pharma",                1730.0,  'Pharma'),
            ("ITC.NS",        "ITC Limited",               460.0,   'FMCG'),
            ("HINDUNILVR.NS", "Hindustan Unilever",        2380.0,  'FMCG'),
            ("TITAN.NS",      "Titan",                     3320.0,  'Consumer'),
            ("ASIANPAINT.NS", "Asian Paints",              2720.0,  'Consumer'),
            ("DMART.NS",      "Avenue Supermarts (DMart)", 4400.0,  'Consumer'),
            ("INDHOTEL.NS",   "Indian Hotels (Taj)",       810.0,   'Consumer'),
            # Telecom
            ("BHARTIARTL.NS", "Bharti Airtel",             1820.0,  'Telecom'),
            # Commodity
            ("GOLDBEES.NS",   "Gold BeES ETF",             72.0,    'Commodity'),
            # Mid / High Risk
            ("IRCTC.NS",      "IRCTC",                     840.0,   'PSU'),
            ("ZOMATO.NS",     "Zomato",                    240.0,   'Tech'),
            ("PAYTM.NS",      "Paytm",                     820.0,   'Tech'),
            ("SWIGGY.NS",     "Swiggy",                    390.0,   'Tech'),
            ("VEDL.NS",       "Vedanta",                   460.0,   'Mining'),
        ]
        for sym, name, price, sector in initial_data:
            s = Stock(sym, name, price, sector)
            s.volatility = 0.0015 + random.uniform(0, 0.003)
            self.stocks[sym] = s

    async def seed_from_real_data(self):
        """Attempt to seed prices from live NSE data via yfinance."""
        try:
            from engine.real_data import fetch_real_prices, GAME_TO_NSE
            prices = await fetch_real_prices()
            # Map game ticker → NSE symbol → stock object
            nse_to_game = {v: k for k, v in GAME_TO_NSE.items()}
            seeded = 0
            for nse_sym, stock in self.stocks.items():
                game_sym = nse_to_game.get(nse_sym)
                if game_sym and game_sym in prices:
                    stock.seed_price(prices[game_sym])
                    seeded += 1
            print(f"[MarketSimulator] Seeded {seeded} stocks from real data")
        except Exception as e:
            print(f"[MarketSimulator] Real seed failed, using defaults: {e}")

    async def run(self):
        """Async price-tick loop with sector correlation."""
        self.is_running = True
        # Attempt real-price seed on first run
        await self.seed_from_real_data()
        while self.is_running:
            # Compute one sector bias per sector per tick
            sector_biases: Dict[str, float] = {}
            for sector, syms in SECTOR_GROUPS.items():
                sector_biases[sector] = random.gauss(0, 0.001)

            for stock in self.stocks.values():
                bias = sector_biases.get(stock.sector, 0.0)
                stock.tick(sector_bias=bias)

            await asyncio.sleep(3)

    def apply_news_shock(self, symbol: str, trend: float):
        if symbol in self.stocks:
            self.stocks[symbol].trend += trend

    def apply_sector_shock(self, sector: str, trend: float):
        for sym in SECTOR_GROUPS.get(sector, []):
            if sym in self.stocks:
                self.stocks[sym].trend += trend

    def get_all_quotes(self):
        return [s.get_quote() for s in self.stocks.values()]

    def get_quote(self, symbol: str):
        s = self.stocks.get(symbol)
        return s.get_quote() if s else None

    def get_history(self, symbol: str):
        s = self.stocks.get(symbol)
        return s.history if s else []


market_engine = MarketSimulator()
