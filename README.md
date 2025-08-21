# PricePilot – Quote Calculator

A simple, test-backed quote calculator for software projects. It provides a pure Python core for pricing and Excel export, plus a no-build web UI for quick quoting and sharing. GitHub Actions runs tests and can deploy the web UI to GitHub Pages.

## Features

- Core calculation (Python): base hourly × complexity × risk × hours
- Quote creation: items + additional costs → subtotal, tax, total
- Excel export: Summary + Details worksheets
- Web UI (no build required): task list, extra costs, live totals
- Type manager: custom labels (labels only, not used for price)
- Multiplier editor: complexity and risk multipliers (persisted)
- Salary helper: monthly → hourly, OT folded into effective hourly
- Tax toggle: include/exclude business tax (persisted, default off)
- Other costs: dynamic rows (name + amount) and validation

## Repository Structure

- `src/python/price_calculator.py` – Python core (PriceCalculator, export)
- `examples/example_usage.py` – Example script
- `tests/python/` – Python tests (pytest)
- `web/index.html` – Web UI entry
- `web/js/` – Web modules (`calculator.js`, `main.js`, `export.js`)
- `web/__tests__/` – Web tests (Vitest)
- `.github/workflows/deploy.yml` – CI (tests) + Pages deploy

## Requirements

- Python 3.10+ (tested on 3.11)
- Node.js 18+ (for web tests and optional Pages deploy)

## Getting Started (Python)

1) Create venv and install deps

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt pytest pytest-cov
```

2) Run example

```
python examples/example_usage.py
```

3) Run tests (with coverage)

```
pytest --cov=src/python -q
```

## Getting Started (Web)

1) Open the UI

- Open `web/index.html` directly in your browser (no build required), or
- Deploy to GitHub Pages via the included workflow (see below)

2) Install and run web tests (optional)

```
cd web
npm ci
npm test
```

## Web UI – Key Controls

- Add task rows and enter hours, choose complexity/risk; totals update live.
- Type is a label only and does not affect price.
- Other costs: add custom rows with name + amount.
- Salary settings: derive base hourly from monthly/days, or enter manually; OT factor is folded into effective hourly.
- Tax toggle: include/exclude tax; the state persists in `localStorage`.
- Type manager: add/edit/reorder types (labels), persists in `localStorage`.
- Multiplier editor: edit complexity/risk multipliers, persists in `localStorage`.

## Excel Export

Both Python and Web implementations export a workbook that contains:

- Summary sheet
  - Project info, a simple “task list” (columns: Type, Cost), extras, and totals
- Details sheet
  - Full breakdown per task (type, hours, multipliers, rates, subtotal)

Python export:

```
from src.python.price_calculator import export_to_excel
# quote = PriceCalculator().create_quote(...)
export_to_excel(quote, "quote.xlsx")
```

Web export:

- Click “匯出 Excel” in the UI (uses SheetJS)

## CI and Pages

- GitHub Actions: runs Python + web tests on pushes/PRs to `main`
- Pages deploy (official flow): builds `web/dist` and publishes to Pages
  - Enable Pages: Settings → Pages → “GitHub Actions”

## Notes & Conventions

- Currency is not enforced; numbers are treated as raw amounts.
- Validation: non-negative amounts and hours; zero/negative task hours clamp to 0.
- Persistence: Web UI saves preferences (types, multipliers, salary, tax toggle) and draft form to `localStorage`.

## License

Proprietary (or per your repository policy). Do not distribute without permission.

