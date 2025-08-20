import pytest

from src.python import PriceCalculator


def test_basic_calculation():
    calc = PriceCalculator(tax_rate=0.1)
    tasks = [
        {"name": "Task A", "hours": 5, "rate": 100},
        {"name": "Task B", "hours": 3, "rate": 150, "multiplier": 1.2},
    ]
    additional = {"Licenses": 80}

    quote = calc.calculate(tasks, additional)
    # subtotal = 5*100 + 3*150*1.2 + 80 = 500 + 540 + 80 = 1120
    # tax = 1120 * 0.1 = 112
    # total = 1232
    assert quote["subtotal"] == 1120.0
    assert quote["tax"] == 112.0
    assert quote["total"] == 1232.0


def test_invalid_negative_values():
    calc = PriceCalculator()
    with pytest.raises(ValueError):
        calc.calculate([{"hours": -1, "rate": 100}])

