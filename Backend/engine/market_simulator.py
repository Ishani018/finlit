import asyncio
import random
from typing import Dict, List
from datetime import datetime, timedelta

class Stock:
    def __init__(self, symbol: str, name: str, initial_price: float):
        self.symbol = symbol
        self.name = name
        self.current_price = initial_price
        self.previous_close = initial_price - random.uniform(-10, 10) # Mock previous close
        self.history: List[Dict] = []  # List of OHLC dicts
        
        # Internal tracking for generating OHLC
        self._current_open = initial_price
        self._current_high = initial_price
        self._current_low = initial_price
        self._last_candle_time = datetime.now()
        
        # Volatility & Trend (for fake news events)
        self.volatility = 0.002
        self.trend = 0.0

    def tick(self):
        """Generates a new tick price based on random walk + trend."""
        change_pct = random.gauss(self.trend, self.volatility)
        new_price = self.current_price * (1 + change_pct)
        # Prevent stock from going to zero
        self.current_price = max(1.0, round(new_price, 2))
        
        # Update current candle high/low
        self._current_high = max(self._current_high, self.current_price)
        self._current_low = min(self._current_low, self.current_price)
        
        # Every minute, close the candle (for UI charts)
        now = datetime.now()
        if (now - self._last_candle_time).total_seconds() >= 60:
            self.history.append({
                "time": self._last_candle_time.isoformat(),
                "open": self._current_open,
                "high": self._current_high,
                "low": self._current_low,
                "close": self.current_price
            })
            # Keep history to last 100 candles for memory safety
            if len(self.history) > 100:
                self.history.pop(0)
                
            # Reset candle
            self._current_open = self.current_price
            self._current_high = self.current_price
            self._current_low = self.current_price
            self._last_candle_time = now
            
        # Decay the trend back to 0 over time
        self.trend *= 0.95

    def get_quote(self):
        change = self.current_price - self.previous_close
        change_pct = (change / self.previous_close) * 100 if self.previous_close else 0
        return {
            "symbol": self.symbol,
            "name": self.name,
            "price": self.current_price,
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "previous_close": round(self.previous_close, 2)
        }

class MarketSimulator:
    def __init__(self):
        self.stocks: Dict[str, Stock] = {}
        self.is_running = False
        self._initialize_stocks()
        
    def _initialize_stocks(self):
        # Top Indian Companies for Real Fake Market
        initial_data = [
            ("RELIANCE.NS", "Reliance Industries", 2950.0),
            ("TCS.NS", "Tata Consultancy", 4100.0),
            ("HDFCBANK.NS", "HDFC Bank", 1450.0),
            ("INFY.NS", "Infosys", 1680.0),
            ("ICICIBANK.NS", "ICICI Bank", 1080.0),
            ("SBI.NS", "State Bank of India", 760.0),
            ("BHARTIARTL.NS", "Bharti Airtel", 1200.0),
            ("ITC.NS", "ITC Limited", 420.0),
            ("LT.NS", "Larsen & Toubro", 3500.0),
            ("BAJFINANCE.NS", "Bajaj Finance", 7100.0),
            ("ZOMATO.NS", "Zomato Ltd", 185.0),
            ("TATAMOTORS.NS", "Tata Motors", 980.0),
            ("SUNPHARMA.NS", "Sun Pharma", 1480.0),
            ("NTPC.NS", "NTPC Limited", 340.0),
            ("M&M.NS", "Mahindra & Mahindra", 1950.0)
        ]
        for sym, name, price in initial_data:
            self.stocks[sym] = Stock(sym, name, price)
            
    async def run(self):
        """Async loop to update stock prices."""
        self.is_running = True
        while self.is_running:
            for stock in self.stocks.values():
                stock.tick()
            await asyncio.sleep(3) # TICK every 3 seconds
            
    def apply_news_shock(self, symbol: str, trend: float):
        """Applies a trend modifier to a specific stock due to news."""
        if symbol in self.stocks:
            self.stocks[symbol].trend += trend
            
    def get_all_quotes(self):
        return [stock.get_quote() for stock in self.stocks.values()]
        
    def get_quote(self, symbol: str):
        if symbol in self.stocks:
            return self.stocks[symbol].get_quote()
        return None
        
    def get_history(self, symbol: str):
        if symbol in self.stocks:
            return self.stocks[symbol].history
        return []

# Singleton instance
market_engine = MarketSimulator()
