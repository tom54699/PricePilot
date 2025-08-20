# 實作計劃

- [x] 1. 修復現有 Python 代碼問題
  - [x] 修復 PriceCalculator 類別中的縮排錯誤
  - [x] 確保 create_quote 方法正確定義在類別內
  - [x] 修復 export_to_excel 方法的縮排問題（以 openpyxl 實作）
  - [x] 驗證所有方法都能正常執行（新增 Python 單元測試與 example）
  - _需求: 1.1, 1.2, 1.3, 1.4_

- [x] 2. 建立基本的 HTML 介面結構
  - [x] 建立 index.html 主頁面
  - [x] 整合 Bootstrap 5 CDN 樣式框架
  - [x] 建立報價表單的基本 HTML 結構
  - [x] 建立任務輸入區域和動態新增功能
  - _需求: 2.1, 2.2_

- [x] 3. 實作 JavaScript 計算邏輯
  - [x] 建立 PriceCalculator JavaScript 類別 (web/js/calculator.js)
  - [x] 移植 Python 的費率設定到 JavaScript
  - [x] 實作 calculateItemPrice 方法
  - [x] 實作 createQuote 方法
  - [x] 添加輸入驗證和錯誤處理
  - _需求: 3.1, 3.2, 3.3, 3.4_

- [x] 4. 建立互動式使用者介面
  - [x] 實作表單輸入處理邏輯 (web/js/main.js)
  - [x] 建立動態任務新增/刪除功能
  - [x] 實作即時價格計算和顯示（輸入變更即時計算）
  - [x] 添加表單驗證和錯誤提示（Bootstrap 驗證）
  - _需求: 2.3, 2.4_

- [x] 5. 實作 Excel 匯出功能
  - [x] 整合 SheetJS 函式庫（CDN）
  - [x] 建立 Excel 檔案生成邏輯 (web/js/export.js)
  - [x] 實作報價摘要工作表生成
  - [x] 實作詳細項目工作表生成
  - [x] 添加檔案下載功能
  - _需求: 4.1, 4.2, 4.3, 4.4_

- [x] 6. 建立專案檔案結構和設定
  - [x] 建立完整的專案目錄結構
  - [x] 建立 package.json 檔案（web/）
  - [x] 設定開發和建置腳本（占位 build、測試指令）
  - [x] 建立 .gitignore 檔案
  - _需求: 所有需求的基礎設施_

- [x] 7. 設定 GitHub Actions 自動部署
  - [x] 建立 .github/workflows/deploy.yml 檔案
  - [x] 設定自動化測試流程（Python + Web）
  - [x] 設定 GitHub Pages 部署配置（peaceiris/actions-gh-pages）
  - [ ] 測試自動部署流程（需推送至 main 驗證）
  - _需求: 部署需求_

- [x] 8. 建立單元測試
  - [x] 建立 JavaScript 測試檔案 (web/__tests__/priceCalculator.test.ts)
  - [x] 測試計算邏輯的正確性
  - [x] 測試邊界條件和錯誤處理（部分）
  - [x] 設定測試執行腳本 (package.json)
  - _需求: 1.4, 3.1, 3.2, 3.3, 3.4_

- [ ] 9. 優化使用者體驗
  - 添加載入狀態指示器
  - 實作本地儲存功能儲存草稿
  - 添加響應式設計支援行動裝置
  - 改善表單的可用性和視覺設計
  - _需求: 2.1, 2.2, 4.4_

- [ ] 10. 建立專案文件和部署測試
  - 建立 README.md 使用說明
  - 建立開發者文件
  - 執行完整的端到端測試
  - 驗證 GitHub Pages 部署功能
  - _需求: 所有需求的驗證_
