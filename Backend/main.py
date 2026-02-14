from fastapi import FastAPI
from pydantic import BaseModel
import random
from typing import List, Dict

app = FastAPI()

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
