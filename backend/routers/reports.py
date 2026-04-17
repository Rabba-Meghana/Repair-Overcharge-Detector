from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from services.database import get_analysis

router = APIRouter()


@router.get("/{analysis_id}/export")
async def export_report(analysis_id: str):
    result = await get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return JSONResponse(
        content=result,
        headers={"Content-Disposition": f"attachment; filename=rod-report-{analysis_id[:8]}.json"},
    )
