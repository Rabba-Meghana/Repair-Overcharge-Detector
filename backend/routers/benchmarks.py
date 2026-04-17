from fastapi import APIRouter
from services.benchmarks import get_benchmark_entries

router = APIRouter()


@router.get("/")
async def list_benchmarks():
    entries = get_benchmark_entries()
    categories = {}
    for e in entries:
        categories.setdefault(e.category, []).append(e.model_dump())
    return {"total": len(entries), "by_category": categories}
