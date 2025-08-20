from src.python import PriceCalculator
from src.python.price_calculator import export_to_excel


def main() -> None:
    calc = PriceCalculator()

    tasks = [
        {"type": "中級開發", "hours": 10, "complexity": "中等", "risk": "中風險", "description": "Backend APIs"},
        {"type": "UI/UX設計", "hours": 12, "complexity": "簡單", "risk": "低風險", "description": "Wireframes"},
    ]
    additional = {"主機費用": 500, "網域費用": 300}

    quote = calc.create_quote("PricePilot", "ACME Corp", tasks, additional)
    print("含稅總計:", quote["含稅總計"], calc.currency)

    path = export_to_excel(quote)
    print("Excel exported:", path)


if __name__ == "__main__":
    main()
