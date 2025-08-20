# Repository Guidelines

## Project Structure & Module Organization
- Current layout: root contains `example.xlsx` (sample data) and `.kiro/` (tooling metadata).
- Place application code in `src/`, tests in `tests/`, utility scripts in `scripts/`, and docs in `docs/`. Store larger data files in `data/`.
- Mirror code and tests: `src/module/foo.py` → `tests/test_foo.py`; `src/module/index.ts` → `__tests__/index.test.ts`.

## Build, Test, and Development Commands
- Python setup: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
- Python tests: `pytest -q` (coverage: `pytest --cov=src`).
- Node setup: `npm ci` (or `pnpm i --frozen-lockfile`).
- Node tests: `npm test` (coverage: `npm test -- --coverage`).
- Lint/format (recommended): Python `ruff check && ruff format`; JS/TS `eslint . && prettier -w .`.

## Coding Style & Naming Conventions
- Python: 4‑space indent, type hints, snake_case for files/functions, PascalCase for classes. Prefer Black/Ruff-compatible formatting.
- JS/TS: 2‑space indent, Prettier formatting, ESLint rules, PascalCase classes, kebab-case file names.
- Keep modules small and focused; avoid circular imports. Name scripts with clear verbs, e.g., `scripts/build_data.py`.

## Testing Guidelines
- Frameworks: Python `pytest`; JS/TS `jest`/`vitest`.
- Location: put tests beside code or under `tests/`. Patterns: Python `tests/test_*.py`; JS/TS `__tests__/*.(test|spec).ts`.
- Aim ≥80% coverage. Include fixtures for spreadsheet-driven cases using `example.xlsx` or `data/fixtures/`.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Use imperative mood and keep scope focused.
- PRs: include a clear description, linked issues, tests, and any doc updates. Add before/after screenshots for UI changes. Ensure CI passes and lint is clean.

## Security & Configuration Tips
- Do not commit secrets. Use `.env` (ignored) and provide `.env.example` for required keys.
- Keep large or sensitive datasets in `data/` and consider Git LFS. Anonymize sample data in `example.xlsx` when sharing.
- Add/maintain `.gitignore` for `.venv`, `node_modules`, `.env`, build artifacts, and `data/raw/`.

