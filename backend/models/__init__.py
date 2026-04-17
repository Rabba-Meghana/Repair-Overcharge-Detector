from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class VehicleType(str, Enum):
    standard = "standard"
    luxury = "luxury"
    commercial = "commercial"
    fleet = "fleet"
    heavy_duty = "heavy_duty"
    electric = "electric"


class LineItemStatus(str, Enum):
    FAIR = "FAIR"
    SLIGHTLY_HIGH = "SLIGHTLY_HIGH"
    OVERPRICED = "OVERPRICED"
    SEVERELY_OVERPRICED = "SEVERELY_OVERPRICED"


class Verdict(str, Enum):
    FAIR = "FAIR"
    INFLATED = "INFLATED"
    SEVERELY_OVERCHARGED = "SEVERELY_OVERCHARGED"


class LineItem(BaseModel):
    description: str
    charged: float
    fair_min: float
    fair_max: float
    fair_avg: float
    status: LineItemStatus
    notes: str
    overcharge_pct: float = 0.0


class ModelResult(BaseModel):
    model: str
    verdict: Verdict
    confidence: float
    total_charged: float
    total_fair: float
    overcharge_amount: float
    overcharge_percent: float
    line_items: list[LineItem]
    summary: str
    recommendations: list[str]
    latency_ms: float


class AnalysisResult(BaseModel):
    id: str
    timestamp: datetime
    verdict: Verdict
    confidence: float
    consensus: bool
    total_charged: float
    total_fair: float
    overcharge_amount: float
    overcharge_percent: float
    line_items: list[LineItem]
    summary: str
    recommendations: list[str]
    model_results: list[ModelResult]
    vehicle_type: VehicleType
    cached: bool = False


class AnalysisRequest(BaseModel):
    work_order: str = Field(..., min_length=20, max_length=10000)
    vehicle_type: VehicleType = VehicleType.standard


class BenchmarkEntry(BaseModel):
    repair: str
    min_price: float
    avg_price: float
    max_price: float
    unit: str
    category: str


class HistoryEntry(BaseModel):
    id: str
    timestamp: datetime
    verdict: Verdict
    total_charged: float
    overcharge_amount: float
    overcharge_percent: float
    vehicle_type: VehicleType
    summary: str
