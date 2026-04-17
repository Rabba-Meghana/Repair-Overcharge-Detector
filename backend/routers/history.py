from fastapi import APIRouter, HTTPException
from services.database import get_history, get_analysis, get_stats

router = APIRouter()


@router.get("/")
async def list_history(limit: int = 20):
    rows = await get_history(limit)
    return {"count": len(rows), "results": rows}


@router.get("/stats")
async def stats():
    return await get_stats()


@router.get("/{analysis_id}")
async def get_one(analysis_id: str):
    result = await get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return result
