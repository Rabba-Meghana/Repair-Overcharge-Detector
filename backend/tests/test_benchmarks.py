import pytest
from services.benchmarks import get_benchmarks, FLEET_MULTIPLIERS


def test_benchmarks_standard():
    b = get_benchmarks("standard")
    assert "oil change" in b
    assert b["oil change"]["avg"] == 55


def test_fleet_multipliers_applied():
    std = get_benchmarks("standard")
    lux = get_benchmarks("luxury")
    multiplier = FLEET_MULTIPLIERS["luxury"]
    assert abs(lux["oil change"]["avg"] - std["oil change"]["avg"] * multiplier) < 0.01


def test_all_vehicle_types():
    for vtype in FLEET_MULTIPLIERS:
        b = get_benchmarks(vtype)
        assert len(b) == 29


def test_benchmark_categories():
    b = get_benchmarks()
    for key, val in b.items():
        assert "category" in val
        assert val["category"] in [
            "Routine Maintenance", "Filters & Ignition", "Brakes",
            "Electrical", "Engine & Drivetrain", "Exhaust & Suspension"
        ]
