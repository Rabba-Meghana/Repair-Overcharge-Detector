import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import analysis, benchmarks, history, reports
from services.cache import cache
from services.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("rod.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()
    logger.info("Warming cache...")
    await cache.warm()
    logger.info("Server ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Repair Overcharge Detector",
    description="Multi-model AI engine for automotive repair invoice analysis",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    request.state.request_id = request_id
    logger.info(f"[{request_id}] {request.method} {request.url.path}")
    response = await call_next(request)
    duration = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration:.1f}ms"
    logger.info(f"[{request_id}] {response.status_code} — {duration:.1f}ms")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "request_id": getattr(request.state, "request_id", "unknown")},
    )


app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(benchmarks.router, prefix="/api/v1/benchmarks", tags=["Benchmarks"])
app.include_router(history.router, prefix="/api/v1/history", tags=["History"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "cache_size": cache.size(),
    }
