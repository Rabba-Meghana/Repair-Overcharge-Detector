from models import BenchmarkEntry

FLEET_MULTIPLIERS = {
    "standard": 1.0,
    "luxury": 1.30,
    "commercial": 1.15,
    "fleet": 1.10,
    "heavy_duty": 1.25,
    "electric": 1.20,
}

RAW_BENCHMARKS = {
    # Routine Maintenance
    "oil change": {"min": 35, "max": 75, "avg": 55, "unit": "service", "category": "Routine Maintenance"},
    "oil change synthetic": {"min": 65, "max": 120, "avg": 90, "unit": "service", "category": "Routine Maintenance"},
    "tire rotation": {"min": 20, "max": 50, "avg": 35, "unit": "service", "category": "Routine Maintenance"},
    "wheel alignment": {"min": 75, "max": 150, "avg": 100, "unit": "service", "category": "Routine Maintenance"},
    "wheel balancing": {"min": 40, "max": 80, "avg": 60, "unit": "service", "category": "Routine Maintenance"},
    "coolant flush": {"min": 80, "max": 150, "avg": 110, "unit": "service", "category": "Routine Maintenance"},
    "transmission fluid flush": {"min": 150, "max": 300, "avg": 200, "unit": "service", "category": "Routine Maintenance"},
    "power steering fluid flush": {"min": 80, "max": 160, "avg": 110, "unit": "service", "category": "Routine Maintenance"},
    "fuel injector cleaning": {"min": 60, "max": 150, "avg": 100, "unit": "service", "category": "Routine Maintenance"},
    # Filters & Ignition
    "air filter replacement engine": {"min": 20, "max": 60, "avg": 40, "unit": "part", "category": "Filters & Ignition"},
    "cabin air filter replacement": {"min": 25, "max": 75, "avg": 45, "unit": "part", "category": "Filters & Ignition"},
    "spark plug replacement": {"min": 100, "max": 250, "avg": 160, "unit": "set", "category": "Filters & Ignition"},
    # Brakes
    "brake pad replacement front": {"min": 100, "max": 200, "avg": 150, "unit": "axle", "category": "Brakes"},
    "brake pad replacement rear": {"min": 90, "max": 180, "avg": 135, "unit": "axle", "category": "Brakes"},
    "brake rotor replacement": {"min": 150, "max": 300, "avg": 220, "unit": "pair", "category": "Brakes"},
    # Electrical
    "battery replacement": {"min": 100, "max": 220, "avg": 160, "unit": "part", "category": "Electrical"},
    "alternator replacement": {"min": 400, "max": 800, "avg": 580, "unit": "part", "category": "Electrical"},
    "starter motor replacement": {"min": 350, "max": 700, "avg": 500, "unit": "part", "category": "Electrical"},
    "oxygen sensor replacement": {"min": 200, "max": 400, "avg": 280, "unit": "sensor", "category": "Electrical"},
    # Engine & Drivetrain
    "timing belt replacement": {"min": 500, "max": 1000, "avg": 700, "unit": "service", "category": "Engine & Drivetrain"},
    "serpentine belt replacement": {"min": 100, "max": 200, "avg": 145, "unit": "service", "category": "Engine & Drivetrain"},
    "fuel pump replacement": {"min": 400, "max": 900, "avg": 620, "unit": "part", "category": "Engine & Drivetrain"},
    "water pump replacement": {"min": 300, "max": 700, "avg": 480, "unit": "part", "category": "Engine & Drivetrain"},
    "radiator replacement": {"min": 400, "max": 900, "avg": 600, "unit": "part", "category": "Engine & Drivetrain"},
    "cv axle replacement": {"min": 200, "max": 500, "avg": 320, "unit": "axle", "category": "Engine & Drivetrain"},
    # Exhaust & Suspension
    "catalytic converter replacement": {"min": 1000, "max": 2500, "avg": 1600, "unit": "part", "category": "Exhaust & Suspension"},
    "muffler replacement": {"min": 150, "max": 400, "avg": 250, "unit": "part", "category": "Exhaust & Suspension"},
    "shock absorber replacement": {"min": 250, "max": 600, "avg": 400, "unit": "pair", "category": "Exhaust & Suspension"},
    "strut replacement": {"min": 300, "max": 750, "avg": 500, "unit": "pair", "category": "Exhaust & Suspension"},
}


def get_benchmarks(vehicle_type: str = "standard") -> dict:
    multiplier = FLEET_MULTIPLIERS.get(vehicle_type, 1.0)
    result = {}
    for key, val in RAW_BENCHMARKS.items():
        result[key] = {
            "min": round(val["min"] * multiplier, 2),
            "max": round(val["max"] * multiplier, 2),
            "avg": round(val["avg"] * multiplier, 2),
            "unit": val["unit"],
            "category": val["category"],
        }
    return result


def get_benchmark_entries() -> list[BenchmarkEntry]:
    entries = []
    for key, val in RAW_BENCHMARKS.items():
        entries.append(BenchmarkEntry(
            repair=key,
            min_price=val["min"],
            avg_price=val["avg"],
            max_price=val["max"],
            unit=val["unit"],
            category=val["category"],
        ))
    return entries
