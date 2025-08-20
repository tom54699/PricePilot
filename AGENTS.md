# Repository Guidelines

This guide aligns with `.kiro/specs/quote-calculator-enhancement/{requirements,design,tasks}.md`.

## Project Structure & Modules
- Source layout (suggested):
  - Python core: `src/python/price_calculator.py` (PriceCalculator, export)
  - Web UI: `web/index.html`, `web/js/priceCalculator.js`
  - Tests: `tests/python/test_price_calculator.py`, `web/__tests__/priceCalculator.test.ts`
  - Data: `data/` (fixtures, e.g., `example.xlsx`)
- Specs: see `.kiro/specs/quote-calculator-enhancement/` for scope and acceptance.

## Build, Test, and Dev
- Python env: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- Run example: `python examples/example_usage.py` (see requirements 1.4)
- Python tests: `pytest --cov=src/python -q`
- Web install: `npm ci` in `web/`
- Web tests: `npm test` (Vitest/Jest); build if needed: `npm run build`
- Lint/format: Python `ruff check && ruff format`; Web `eslint . && prettier -w .`

## Coding Style
- Python: 4 spaces, type hints, snake_case; classes in PascalCase. Fix indentation and method scoping per design.md.
- JS/TS: 2 spaces, Prettier + ESLint; files kebab-case; classes PascalCase.
- Keep compute logic pure; UI logic separated (see design 架構圖)。

## Testing
- Cover calculation logic (rates, multipliers, tax), input validation, and Excel export per requirements.md.
- Naming: Python `tests/test_*.py`; Web `__tests__/*.(test|spec).ts`.
- Target ≥80% coverage; include fixtures from `data/` and `example.xlsx`.

## Task Flow, Commits & PRs
- Follow `.kiro/specs/quote-calculator-enhancement/tasks.md` checklist.
- After each task: `git add -A && git commit -m "feat(task-<n>): <summary>"`.
- Open PR with: scope, linked tasks/requirements, test evidence (logs/screenshots), and Excel output path when relevant.

## Deploy (GitHub)
- Push branch: `git push origin <branch>`; enable Actions. Optional Pages deploy via `.github/workflows/deploy.yml` (build web/ then upload).
- Do not commit secrets; use `.env` and add `.env.example`.
