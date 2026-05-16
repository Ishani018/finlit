from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import asyncio
from contextlib import asynccontextmanager
from typing import List, Dict

from engine.market_simulator import market_engine
from routers import market, trading, news, advisor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run the market engine loop
    task = asyncio.create_task(market_engine.run())
    yield
    # Shutdown
    market_engine.is_running = False
    await task

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router)
app.include_router(trading.router)
app.include_router(news.router)
app.include_router(advisor.router)

class Shock(BaseModel):
    type: str
    severity: float
    description: str

class ShockGenerator:
    """Generates random financial shocks."""
    
    def __init__(self):
        self.shock_types = [
            "Market Crash",
            "Medical Shock",
            "Job Loss",
            "Inflation Spike",
            "Unexpected Expense"
        ]

    def generate_shock(self) -> Shock:
        """Returns a random shock object."""
        shock_type = random.choice(self.shock_types)
        severity = round(random.uniform(0.1, 1.0), 2)
        
        description = f"A sudden {shock_type} has occurred with severity {severity}."
        
        return Shock(
            type=shock_type,
            severity=severity,
            description=description
        )

generator = ShockGenerator()

@app.get("/shock", response_model=Shock)
async def get_shock():
    """Endpoint to get a random financial shock."""
    return generator.generate_shock()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
