from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, TypedDict, Any


class Task(TypedDict, total=False):
    # Spec-aligned task structure
    type: str
    hours: float
    complexity: str
    risk: str
    description: str


class QuoteItem(TypedDict, total=False):
    任務類型: str
    工時: float
    複雜度: str
    風險等級: str
    基礎時薪: int
    調整後時薪: int
    小計: int
    描述: str


class Quote(TypedDict, total=False):
    專案名稱: str
    客戶名稱: str
    報價日期: str
    報價項目: List[QuoteItem]
    開發小計: int
    額外費用: Dict[str, int]
    稅前總計: int
    營業稅: int
    含稅總計: int


@dataclass(slots=True)
class PriceCalculator:
    """Pure calculation logic for quotes.

    Keep this class UI-agnostic and side-effect free.
    """

    tax_rate: float = 0.05  # 5% per requirements
    currency: str = "TWD"
    hourly_rates: Dict[str, int] = field(
        default_factory=lambda: {
            "初級開發": 800,
            "中級開發": 1200,
            "高級開發": 1800,
            "架構設計": 2500,
            "專案管理": 1500,
            "UI/UX設計": 1000,
            "測試": 600,
        }
    )
    complexity_multiplier: Dict[str, float] = field(
        default_factory=lambda: {
            "簡單": 1.0,
            "中等": 1.3,
            "複雜": 1.8,
            "非常複雜": 2.5,
        }
    )
    risk_multiplier: Dict[str, float] = field(
        default_factory=lambda: {
            "低風險": 1.0,
            "中風險": 1.2,
            "高風險": 1.5,
        }
    )

    def validate_task_input(self, task: Dict[str, Any]) -> Task:
        validated: Task = {
            "type": str(task.get("type") or "中級開發"),
            "hours": max(0.0, float(task.get("hours", 0.0))),
            "complexity": str(task.get("complexity") or "中等"),
            "risk": str(task.get("risk") or "中風險"),
            "description": str(task.get("description", "")),
        }
        return validated

    def calculate_item_price(
        self,
        task_type: str,
        hours: float,
        complexity: str = "中等",
        risk: str = "中風險",
        description: str = "",
    ) -> QuoteItem:
        base_rate = int(self.hourly_rates.get(task_type, self.hourly_rates["中級開發"]))
        hours = max(0.0, float(hours))
        c_mul = float(self.complexity_multiplier.get(complexity, self.complexity_multiplier["中等"]))
        r_mul = float(self.risk_multiplier.get(risk, self.risk_multiplier["中風險"]))
        adjusted_rate = int(round(base_rate * c_mul * r_mul))
        subtotal = int(round(adjusted_rate * hours))
        return QuoteItem(
            任務類型=task_type,
            工時=hours,
            複雜度=complexity,
            風險等級=risk,
            基礎時薪=base_rate,
            調整後時薪=adjusted_rate,
            小計=subtotal,
            描述=description,
        )

    def create_quote(
        self,
        project_name: str,
        client_name: str,
        tasks: List[Dict[str, Any]],
        additional_costs: Optional[Dict[str, float]] = None,
    ) -> Quote:
        additional_costs = {**(additional_costs or {})}
        # Normalize additional costs and clamp negatives to zero
        normalized_extra: Dict[str, int] = {}
        for k, v in additional_costs.items():
            normalized_extra[str(k)] = int(round(max(0.0, float(v))))

        items: List[QuoteItem] = []
        for raw in tasks or []:
            t = self.validate_task_input(raw)
            items.append(
                self.calculate_item_price(
                    t["type"], t["hours"], t["complexity"], t["risk"], t.get("description", "")
                )
            )

        dev_subtotal = int(sum(i["小計"] for i in items))
        extra_subtotal = int(sum(normalized_extra.values()))
        pre_tax = dev_subtotal + extra_subtotal
        tax = int(round(pre_tax * float(self.tax_rate)))
        grand_total = pre_tax + tax

        today = date.today().isoformat()
        quote: Quote = {
            "專案名稱": project_name,
            "客戶名稱": client_name,
            "報價日期": today,
            "報價項目": items,
            "開發小計": dev_subtotal,
            "額外費用": {**normalized_extra, "額外費用小計": extra_subtotal},
            "稅前總計": pre_tax,
            "營業稅": tax,
            "含稅總計": grand_total,
        }
        return quote

    # Backward-compatible simple calculator retained for quick usage
    def calculate(self, tasks: List[Dict[str, Any]], additional_costs: Optional[Dict[str, float]] = None) -> Dict[str, float]:
        items = []
        for t in tasks or []:
            # interpret simple schema: hours, rate, multiplier
            hours = max(0.0, float(t.get("hours", 0.0)))
            rate = float(t.get("rate", 0.0))
            multiplier = float(t.get("multiplier", 1.0))
            if rate < 0 or multiplier < 0:
                raise ValueError("rate/multiplier cannot be negative")
            items.append(hours * rate * multiplier)
        subtotal = float(sum(items))
        for _, cost in (additional_costs or {}).items():
            subtotal += max(0.0, float(cost))
        tax = subtotal * float(self.tax_rate)
        total = subtotal + tax
        return {"subtotal": round(subtotal, 2), "tax": round(tax, 2), "total": round(total, 2)}


def export_quote(quote: Quote, path: str) -> str:
    # Legacy name kept; delegate to class-style implementation not required
    return export_to_excel(quote, path)


def export_to_excel(quote: Quote, filename: Optional[str] = None) -> str:
    from openpyxl import Workbook

    wb = Workbook()
    # Summary sheet
    ws = wb.active
    ws.title = "摘要"

    ws.append(["專案名稱", quote.get("專案名稱", "")])
    ws.append(["客戶名稱", quote.get("客戶名稱", "")])
    ws.append(["報價日期", quote.get("報價日期", "")])
    ws.append([])

    # Task list (simple) near the top
    ws.append(["報價項目"])  # section title
    ws.append(["任務類型", "費用"])
    for item in quote.get("報價項目", []) or []:
        ws.append([
            item.get("任務類型", ""),
            item.get("小計", 0),
        ])

    ws.append([])
    ws.append(["開發小計", quote.get("開發小計", 0)])
    ws.append(["額外費用小計", quote.get("額外費用", {}).get("額外費用小計", 0)])
    # List individual extra costs
    for k, v in (quote.get("額外費用", {}) or {}).items():
        if k == "額外費用小計":
            continue
        ws.append([k, v])
    ws.append([])
    ws.append(["稅前總計", quote.get("稅前總計", 0)])
    ws.append(["營業稅", quote.get("營業稅", 0)])
    ws.append(["含稅總計", quote.get("含稅總計", 0)])

    # Details sheet
    ws2 = wb.create_sheet(title="詳細項目")
    headers = ["任務類型", "工時", "複雜度", "風險等級", "基礎時薪", "調整後時薪", "小計", "描述"]
    ws2.append(headers)
    for item in quote.get("報價項目", []) or []:
        row = [
            item.get("任務類型", ""),
            item.get("工時", 0),
            item.get("複雜度", ""),
            item.get("風險等級", ""),
            item.get("基礎時薪", 0),
            item.get("調整後時薪", 0),
            item.get("小計", 0),
            item.get("描述", ""),
        ]
        ws2.append(row)

    # Determine filename
    out = filename or f"quote_{quote.get('專案名稱', 'project')}_{quote.get('報價日期', '')}.xlsx"
    wb.save(out)
    return out
