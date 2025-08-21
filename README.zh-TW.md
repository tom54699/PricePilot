# PricePilot – 報價計算器

一個含測試的軟體專案報價計算器。提供純 Python 的核心計算與 Excel 匯出，並有免建置的 Web 介面可快速試算、匯出與分享。GitHub Actions 會跑測試，也可部署 Web 介面到 GitHub Pages。

## 特色

- 核心計算（Python）：基本時薪 × 複雜度倍率 × 風險倍率 × 工時
- 產生報價：任務項目 + 額外費用 → 小計、稅額、總計
- Excel 匯出：摘要 + 詳細兩個工作表
- Web 介面（免 build）：任務清單、其他費用、即時計算
- 類型管理：自訂任務類型（僅標籤，不影響計價）
- 倍率管理：複雜度/風險倍率可調整（會保存）
- 時薪輔助：月薪 → 時薪換算，並將加班倍率折入有效時薪
- 稅額開關：可勾選是否計算營業稅（會保存，預設關閉）
- 其他費用：可自由新增名稱 + 金額，含基本驗證

## 專案結構

- `src/python/price_calculator.py` – Python 核心（PriceCalculator 與匯出）
- `examples/example_usage.py` – 範例腳本
- `tests/python/` – Python 單元測試（pytest）
- `web/index.html` – Web 入口
- `web/js/` – Web 模組（`calculator.js`, `main.js`, `export.js`）
- `web/__tests__/` – Web 測試（Vitest）
- `.github/workflows/deploy.yml` – CI 測試 + Pages 部署

## 需求

- Python 3.10+（測試於 3.11）
- Node.js 18+（執行 Web 測試與可選的 Pages 部署）

## 快速開始（Python）

1) 建立虛擬環境並安裝相依

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt pytest pytest-cov
```

2) 執行範例

```
python examples/example_usage.py
```

3) 執行測試（含覆蓋率）

```
pytest --cov=src/python -q
```

## 快速開始（Web）

1) 開啟介面

- 直接用瀏覽器打開 `web/index.html`（免建置），或
- 使用 GitHub Pages 部署（見下）

2) 安裝並執行 Web 測試（選用）

```
cd web
npm ci
npm test
```

## Web 介面 – 重點

- 新增任務列，輸入工時並選擇複雜度/風險；總額即時更新。
- 類型僅作為標籤，不影響計價。
- 其他費用：新增自訂費用（名稱 + 金額）。
- 時薪設定：可用月薪/天數換算或手動輸入；加班倍率會折入有效時薪。
- 稅額開關：勾/不勾是否計算營業稅；狀態會保存到 `localStorage`。
- 類型管理：新增/編輯/排序；保存於 `localStorage`。
- 倍率管理：調整複雜度/風險倍率；保存於 `localStorage`。

## Excel 匯出

Python 與 Web 版本皆會匯出：

- 摘要工作表：
  - 專案資訊、簡化的「報價項目」（欄位：任務類型、費用）、額外費用與總計
- 詳細工作表：
  - 任務明細（類型、工時、倍率、時薪、各項小計）

Python 匯出：

```
from src.python.price_calculator import export_to_excel
# quote = PriceCalculator().create_quote(...)
export_to_excel(quote, "quote.xlsx")
```

Web 匯出：

- 介面按下「匯出 Excel」（使用 SheetJS）

## CI 與 Pages

- GitHub Actions：對 `main` 的 push/PR 會跑 Python + Web 測試
- Pages 部署（官方流程）：建置 `web/dist` 並發布到 Pages
  - 啟用方式：Settings → Pages → Source 選擇「GitHub Actions」

## 注意事項

- 幣別未強制，金額以數值處理。
- 驗證：費用與工時需為非負；工時若 <= 0 會當作 0 計。
- 保存：Web 會將偏好（類型、倍率、時薪、稅額開關）與表單草稿保存到 `localStorage`。

## 授權

依你的專案/公司政策。未經允許請勿散佈。

