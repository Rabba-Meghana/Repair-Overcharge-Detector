import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header
from models import AnalysisRequest, AnalysisResult, Verdict
from services.engine import run_consensus
from services.cache import cache
from services.database import save_analysis

logger = logging.getLogger("rod.analysis")
router = APIRouter()


def aggregate_results(valid_results, consensus, request):
    primary = valid_results[0]

    if len(valid_results) > 1:
        avg_confidence = sum(r.confidence for r in valid_results) / len(valid_results)
        avg_charged = sum(r.total_charged for r in valid_results) / len(valid_results)
        avg_fair = sum(r.total_fair for r in valid_results) / len(valid_results)
        avg_overcharge = sum(r.overcharge_amount for r in valid_results) / len(valid_results)
        avg_overcharge_pct = sum(r.overcharge_percent for r in valid_results) / len(valid_results)

        verdicts = [r.verdict for r in valid_results]
        verdict_priority = {Verdict.SEVERELY_OVERCHARGED: 2, Verdict.INFLATED: 1, Verdict.FAIR: 0}
        final_verdict = max(verdicts, key=lambda v: verdict_priority[v])

        if consensus:
            avg_confidence = min(avg_confidence * 1.1, 0.99)
        else:
            avg_confidence = avg_confidence * 0.85
    else:
        avg_confidence = primary.confidence * 0.85
        avg_charged = primary.total_charged
        avg_fair = primary.total_fair
        avg_overcharge = primary.overcharge_amount
        avg_overcharge_pct = primary.overcharge_percent
        final_verdict = primary.verdict

    all_recommendations = []
    seen = set()
    for r in valid_results:
        for rec in r.recommendations:
            if rec not in seen:
                all_recommendations.append(rec)
                seen.add(rec)

    return {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "verdict": final_verdict,
        "confidence": round(avg_confidence, 3),
        "consensus": consensus,
        "total_charged": round(avg_charged, 2),
        "total_fair": round(avg_fair, 2),
        "overcharge_amount": round(avg_overcharge, 2),
        "overcharge_percent": round(avg_overcharge_pct, 1),
        "line_items": [item.model_dump() for item in primary.line_items],
        "summary": primary.summary,
        "recommendations": all_recommendations[:4],
        "model_results": [r.model_dump() for r in valid_results],
        "vehicle_type": request.vehicle_type,
        "cached": False,
    }


@router.post("/", response_model=AnalysisResult)
async def analyze(
    request: AnalysisRequest,
    x_api_key: str = Header(..., description="Groq API key"),
):
    cached = cache.get(request.work_order, request.vehicle_type)
    if cached:
        cached["cached"] = True
        return AnalysisResult(**cached)

    try:
        valid_results, consensus = await run_consensus(
            request.work_order, request.vehicle_type, x_api_key
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal analysis error.")

    result = aggregate_results(valid_results, consensus, request)
    cache.set(request.work_order, request.vehicle_type, result)

    try:
        await save_analysis(result)
    except Exception as e:
        logger.warning(f"Failed to persist analysis: {e}")

    return AnalysisResult(**result)
