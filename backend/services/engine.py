import time
import json
import re
import asyncio
import logging
from groq import AsyncGroq
from models import ModelResult, LineItem, Verdict, LineItemStatus
from services.benchmarks import get_benchmarks

logger = logging.getLogger("rod.engine")

MODELS = [
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
]


def build_system_prompt(benchmarks: dict) -> str:
    return f"""You are a senior automotive repair cost auditor with 25 years of experience.
Analyze repair invoices against these US national market rates:

{json.dumps(benchmarks, indent=2)}

Respond ONLY with a valid JSON object. No markdown. No preamble. No explanation outside the JSON.

Format:
{{
  "verdict": "FAIR" | "INFLATED" | "SEVERELY_OVERCHARGED",
  "confidence": 0.0-1.0,
  "total_charged": <number>,
  "total_fair": <number>,
  "overcharge_amount": <number>,
  "overcharge_percent": <number>,
  "line_items": [
    {{
      "description": "<service>",
      "charged": <number>,
      "fair_min": <number>,
      "fair_max": <number>,
      "fair_avg": <number>,
      "overcharge_pct": <number>,
      "status": "FAIR" | "SLIGHTLY_HIGH" | "OVERPRICED" | "SEVERELY_OVERPRICED",
      "notes": "<one concise sentence>"
    }}
  ],
  "summary": "<two sentences, professional tone, no filler>",
  "recommendations": ["<specific action>", "<specific action>"]
}}

Classification thresholds (apply strictly):
Line item:
- FAIR: within 25% of market average
- SLIGHTLY_HIGH: 25-50% above average
- OVERPRICED: 50-90% above average
- SEVERELY_OVERPRICED: 90%+ above average

Overall verdict:
- FAIR: total within 25% of fair estimate — this is the expected result for most legitimate shops
- INFLATED: total 25-60% above fair estimate
- SEVERELY_OVERCHARGED: total 60%+ above fair estimate

Critical: shop supplies, taxes, environmental fees, and diagnostic fees are standard — do not penalize for them. Labor at $80-$150/hr is normal. Only mark INFLATED if the total clearly and substantially exceeds market rates."""


def parse_response(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)
    return json.loads(text)


async def run_single_model(client: AsyncGroq, model: str, work_order: str, benchmarks: dict) -> ModelResult:
    start = time.perf_counter()
    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": build_system_prompt(benchmarks)},
                {"role": "user", "content": f"Analyze this repair invoice:\n\n{work_order}"},
            ],
            temperature=0.05,
            max_tokens=2048,
        )
        latency = (time.perf_counter() - start) * 1000
        raw = completion.choices[0].message.content
        data = parse_response(raw)

        line_items = []
        for item in data.get("line_items", []):
            try:
                line_items.append(LineItem(
                    description=item.get("description", ""),
                    charged=float(item.get("charged", 0)),
                    fair_min=float(item.get("fair_min", 0)),
                    fair_max=float(item.get("fair_max", 0)),
                    fair_avg=float(item.get("fair_avg", 0)),
                    overcharge_pct=float(item.get("overcharge_pct", 0)),
                    status=LineItemStatus(item.get("status", "FAIR")),
                    notes=item.get("notes", ""),
                ))
            except Exception as e:
                logger.warning(f"Skipping malformed line item from {model}: {e}")

        return ModelResult(
            model=model,
            verdict=Verdict(data.get("verdict", "FAIR")),
            confidence=float(data.get("confidence", 0.7)),
            total_charged=float(data.get("total_charged", 0)),
            total_fair=float(data.get("total_fair", 0)),
            overcharge_amount=float(data.get("overcharge_amount", 0)),
            overcharge_percent=float(data.get("overcharge_percent", 0)),
            line_items=line_items,
            summary=data.get("summary", ""),
            recommendations=data.get("recommendations", []),
            latency_ms=round(latency, 1),
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        logger.error(f"Model {model} failed: {e}")
        raise RuntimeError(f"{model} failed: {e}")


async def run_consensus(work_order: str, vehicle_type: str, api_key: str) -> tuple[list[ModelResult], bool]:
    client = AsyncGroq(api_key=api_key)
    benchmarks = get_benchmarks(vehicle_type)

    tasks = [run_single_model(client, model, work_order, benchmarks) for model in MODELS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    valid = [r for r in results if isinstance(r, ModelResult)]
    if not valid:
        raise RuntimeError("All models failed. Check your Groq API key.")

    if len(valid) < 2:
        logger.warning("Only one model succeeded — no consensus possible")
        return valid, False

    verdicts = [r.verdict for r in valid]
    consensus = len(set(verdicts)) == 1
    return valid, consensus
