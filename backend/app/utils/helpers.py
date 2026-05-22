import json
import re
from typing import Any


def parse_json_response(text: str) -> dict[str, Any]:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip())
    cleaned = re.sub(r'\s*```$', '', cleaned)
    return json.loads(cleaned)


def format_amount(amount: float) -> str:
    return f"{amount:,.2f} MAD"


def clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, value))
