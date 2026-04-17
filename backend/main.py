from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json
import re
import os

app = FastAPI(title="Repair Overcharge Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 29-repair benchmark database
BENCHMARK_DB = {
    "oil change": {"min": 35, "max": 75, "avg": 55, "unit": "service"},
    "oil change synthetic": {"min": 65, "max": 120, "avg": 90, "unit": "service"},
    "brake pad replacement front": {"min": 100, "max": 200, "avg": 150, "unit": "axle"},
    "brake pad replacement rear": {"min": 90, "max": 180, "avg": 135, "unit": "axle"},
    "brake rotor replacement": {"min": 150, "max": 300, "avg": 220, "unit": "pair"},
    "tire rotation": {"min": 20, "max": 50, "avg": 35, "unit": "service"},
    "wheel alignment": {"min": 75, "max": 150, "avg": 100, "unit": "service"},
    "wheel balancing": {"min": 40, "max": 80, "avg": 60, "unit": "service"},
    "air filter replacement engine": {"min": 20, "max": 60, "avg": 40, "unit": "part"},
    "cabin air filter replacement": {"min": 25, "max": 75, "avg": 45, "unit": "part"},
    "spark plug replacement": {"min": 100, "max": 250, "avg": 160, "unit": "set"},
    "battery replacement": {"min": 100, "max": 220, "avg": 160, "unit": "part"},
    "alternator replacement": {"min": 400, "max": 800, "avg": 580, "unit": "part"},
    "starter motor replacement": {"min": 350, "max": 700, "avg": 500, "unit": "part"},
    "timing belt replacement": {"min": 500, "max": 1000, "avg": 700, "unit": "service"},
    "serpentine belt replacement": {"min": 100, "max": 200, "avg": 145, "unit": "service"},
    "coolant flush": {"min": 80, "max": 150, "avg": 110, "unit": "service"},
    "transmission fluid flush": {"min": 150, "max": 300, "avg": 200, "unit": "service"},
    "power steering fluid flush": {"min": 80, "max": 160, "avg": 110, "unit": "service"},
    "fuel injector cleaning": {"min": 60, "max": 150, "avg": 100, "unit": "service"},
    "fuel pump replacement": {"min": 400, "max": 900, "avg": 620, "unit": "part"},
    "oxygen sensor replacement": {"min": 200, "max": 400, "avg": 280, "unit": "sensor"},
    "catalytic converter replacement": {"min": 1000, "max": 2500, "avg": 1600, "unit": "part"},
    "muffler replacement": {"min": 150, "max": 400, "avg": 250, "unit": "part"},
    "shock absorber replacement": {"min": 250, "max": 600, "avg": 400, "unit": "pair"},
    "strut replacement": {"min": 300, "max": 750, "avg": 500, "unit": "pair"},
    "cv axle replacement": {"min": 200, "max": 500, "avg": 320, "unit": "axle"},
    "radiator replacement": {"min": 400, "max": 900, "avg": 600, "unit": "part"},
    "water pump replacement": {"min": 300, "max": 700, "avg": 480, "unit": "part"},
}

# Fleet vehicle multipliers
FLEET_MULTIPLIERS = {
    "commercial": 1.15,
    "fleet": 1.10,
    "heavy_duty": 1.25,
    "luxury": 1.30,
    "electric": 1.20,
}

class AnalysisRequest(BaseModel):
    work_order: str
    api_key: str
    vehicle_type: str = "standard"

class AnalysisResponse(BaseModel):
    verdict: str
    confidence: float
    total_charged: float
    total_fair: float
    overcharge_amount: float
    overcharge_percent: float
    line_items: list
    summary: str
    recommendations: list

def get_system_prompt():
    benchmark_str = json.dumps(BENCHMARK_DB, indent=2)
    return f"""You are an expert automotive repair cost analyst with 20+ years of experience. 
Your job is to analyze repair work orders and detect overcharging.

You have access to this benchmark database of fair market rates (US national averages):
{benchmark_str}

Analyze the work order and return ONLY valid JSON in this exact format:
{{
  "verdict": "FAIR" | "INFLATED" | "SEVERELY_OVERCHARGED",
  "confidence": 0.0-1.0,
  "total_charged": <number>,
  "total_fair": <number>,
  "overcharge_amount": <number>,
  "overcharge_percent": <number>,
  "line_items": [
    {{
      "description": "<service name>",
      "charged": <number>,
      "fair_min": <number>,
      "fair_max": <number>,
      "fair_avg": <number>,
      "status": "FAIR" | "SLIGHTLY_HIGH" | "OVERPRICED" | "SEVERELY_OVERPRICED",
      "notes": "<brief explanation>"
    }}
  ],
  "summary": "<2-3 sentence overall assessment>",
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"]
}}

Rules:
- FAIR: within 10% of market rate
- SLIGHTLY_HIGH: 10-25% above market rate  
- OVERPRICED: 25-60% above market rate
- SEVERELY_OVERPRICED: 60%+ above market rate
- Overall FAIR: total within 15% of fair estimate
- Overall INFLATED: total 15-40% above fair estimate
- Overall SEVERELY_OVERCHARGED: total 40%+ above fair estimate
- Be specific and professional in notes and recommendations
- Return ONLY the JSON object, no markdown, no explanation"""

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_work_order(request: AnalysisRequest):
    if not request.api_key:
        raise HTTPException(status_code=400, detail="API key required")
    
    try:
        client = Groq(api_key=request.api_key)
        
        multiplier = FLEET_MULTIPLIERS.get(request.vehicle_type.lower(), 1.0)
        
        user_message = f"Analyze this repair work order:\n\n{request.work_order}"
        if multiplier != 1.0:
            user_message += f"\n\nNote: This is a {request.vehicle_type} vehicle. Apply {multiplier}x multiplier to fair market rates."
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": get_system_prompt()},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            max_tokens=2000,
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Clean up response
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        result = json.loads(response_text)
        
        return AnalysisResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/benchmarks")
async def get_benchmarks():
    return {"benchmarks": BENCHMARK_DB}

@app.get("/health")
async def health():
    return {"status": "healthy", "repairs_in_db": len(BENCHMARK_DB)}

@app.get("/")
async def root():
    return {"message": "Repair Overcharge Detector API", "version": "1.0.0"}
