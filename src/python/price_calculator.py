from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, TypedDict


class Task(TypedDict, total=False):
    name: str
    hours: float
    rate: float
    multiplier: float  # e.g., urgency/complexity multiplier; default 1.0


class QuoteBreakdown(TypedDict):
    subtotal: float
    tax: float
    total: float


@dataclass(slots=True)
class PriceCalculator:
    """Pure calculation logic for quotes.

    Keep this class UI-agnostic and side-effect free.
    """

    tax_rate: float = 0.0  # e.g., 0.05 for 5%
    currency: str = "USD"

    def calculate(
        self,
        tasks: List[Task],
        additional_costs: Optional[Dict[str, float]] = None,
    ) -> QuoteBreakdown:
        """Calculate a simple quote breakdown.

        - Each task contributes: hours * rate * multiplier (default 1.0)
        - Additional costs are summed as-is
        - Tax is applied to subtotal using `tax_rate`
        """

        if additional_costs is None:
            additional_costs = {}

        # Validate inputs minimally to keep behavior predictable
        subtotal = 0.0

        for t in tasks or []:
            hours = float(t.get("hours", 0.0))
            rate = float(t.get("rate", 0.0))
            multiplier = float(t.get("multiplier", 1.0))
            if hours < 0 or rate < 0 or multiplier < 0:
                raise ValueError("Task values cannot be negative")
            subtotal += hours * rate * multiplier

        for label, cost in additional_costs.items():
            if float(cost) < 0:
                raise ValueError(f"Additional cost '{label}' cannot be negative")
            subtotal += float(cost)

        if self.tax_rate < 0:
            raise ValueError("tax_rate cannot be negative")

        tax = subtotal * float(self.tax_rate)
        total = subtotal + tax

        return QuoteBreakdown(subtotal=round(subtotal, 2), tax=round(tax, 2), total=round(total, 2))


def export_quote(quote: QuoteBreakdown, path: str) -> str:
    """Export a quote to an Excel file.

    This is a placeholder; implementation will follow the specs using
    `openpyxl` for writing the workbook.
    """
    # Deliberately not implemented yet; keep API stable for callers.
    raise NotImplementedError("Excel export will be implemented per requirements")

