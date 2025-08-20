from src.python import PriceCalculator


def main() -> None:
    calc = PriceCalculator(tax_rate=0.05, currency="USD")

    tasks = [
        {"name": "Design", "hours": 10, "rate": 80},
        {"name": "Development", "hours": 25, "rate": 120, "multiplier": 1.1},
    ]
    additional = {"Hosting": 50}

    quote = calc.calculate(tasks, additional)
    print(f"Subtotal: {quote['subtotal']} {calc.currency}")
    print(f"Tax:      {quote['tax']} {calc.currency}")
    print(f"Total:    {quote['total']} {calc.currency}")


if __name__ == "__main__":
    main()

