# 設計文件

## 概述

報價計算系統基礎功能設計專注於修復現有代碼問題並提供穩定的核心功能。系統採用簡單的物件導向設計，確保代碼可讀性和可維護性，同時提供準確的報價計算和基本的匯出功能。

## 架構

### 系統架構
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   使用者介面    │───▶│  報價計算核心   │───▶│   檔案匯出      │
│  (CLI/Script)   │    │ (PriceCalculator)│    │   (Excel)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   設定資料      │
                       │ (費率/倍數設定) │
                       └─────────────────┘
```

### 核心組件
- **PriceCalculator**: 主要的報價計算類別
- **費率管理**: 管理不同角色的時薪費率
- **計算引擎**: 處理複雜度和風險調整
- **匯出模組**: 負責 Excel 檔案生成

## 組件和介面

### PriceCalculator 類別

#### 屬性
```python
class PriceCalculator:
    hourly_rates: Dict[str, int]           # 角色時薪對照表
    complexity_multiplier: Dict[str, float] # 複雜度倍數
    risk_multiplier: Dict[str, float]       # 風險倍數
```

#### 方法介面
```python
def calculate_item_price(
    task_type: str, 
    hours: float, 
    complexity: str = "中等", 
    risk: str = "中風險"
) -> Dict:
    """計算單項任務價格"""
    
def create_quote(
    project_name: str, 
    client_name: str, 
    tasks: List[Dict], 
    additional_costs: Dict = None
) -> Dict:
    """建立完整報價單"""
    
def export_to_excel(
    quote: Dict, 
    filename: str = None
) -> str:
    """匯出報價單到 Excel"""
```

## 資料模型

### 任務資料結構
```python
Task = {
    "type": str,           # 任務類型 (必填)
    "hours": float,        # 工時 (必填)
    "complexity": str,     # 複雜度 (選填，預設"中等")
    "risk": str,          # 風險等級 (選填，預設"中風險")
    "description": str     # 任務描述 (選填)
}
```

### 報價單資料結構
```python
Quote = {
    "專案名稱": str,
    "客戶名稱": str,
    "報價日期": str,
    "報價項目": List[Dict],
    "開發小計": int,
    "額外費用": {
        "主機費用": int,
        "網域費用": int,
        "維護費用": int,
        "其他費用": int,
        "額外費用小計": int
    },
    "稅前總計": int,
    "營業稅": int,
    "含稅總計": int
}
```

### 計算項目資料結構
```python
QuoteItem = {
    "任務類型": str,
    "工時": float,
    "複雜度": str,
    "風險等級": str,
    "基礎時薪": int,
    "調整後時薪": int,
    "小計": int,
    "描述": str
}
```

## 錯誤處理

### 代碼修復策略
1. **縮排錯誤修復**: 統一使用 4 個空格縮排
2. **方法定義修復**: 確保 `create_quote` 方法正確縮排在類別內
3. **語法檢查**: 驗證所有括號、引號配對正確

### 輸入驗證
```python
def validate_task_input(task: Dict) -> Dict:
    """驗證任務輸入資料"""
    validated_task = {
        "type": task.get("type", "中級開發"),
        "hours": max(0, float(task.get("hours", 0))),
        "complexity": task.get("complexity", "中等"),
        "risk": task.get("risk", "中風險"),
        "description": task.get("description", "")
    }
    return validated_task
```

### 錯誤處理機制
- **無效任務類型**: 使用預設的中級開發費率
- **負數工時**: 自動調整為 0
- **檔案匯出失敗**: 提供錯誤訊息和建議解決方案
- **缺少必要欄位**: 使用合理的預設值

## 測試策略

### 單元測試範圍
1. **計算邏輯測試**
   - 基礎價格計算
   - 複雜度和風險倍數應用
   - 稅額計算準確性

2. **資料處理測試**
   - 輸入驗證功能
   - 預設值處理
   - 邊界條件處理

3. **匯出功能測試**
   - Excel 檔案生成
   - 檔案內容正確性
   - 檔案命名規則

### 整合測試
- 完整報價流程測試
- 範例使用案例驗證
- 檔案匯出端到端測試

### 測試資料
```python
test_tasks = [
    {
        "type": "高級開發",
        "hours": 40,
        "complexity": "複雜",
        "risk": "高風險",
        "description": "核心功能開發"
    },
    {
        "type": "測試",
        "hours": 16,
        "complexity": "簡單",
        "risk": "低風險",
        "description": "單元測試"
    }
]
```

## 實作考量

### 代碼品質改善
- 修復所有語法錯誤和縮排問題
- 添加適當的錯誤處理
- 改善代碼可讀性和註解

### 效能考量
- 計算邏輯簡單直接，無需特殊優化
- Excel 匯出使用 pandas，效能良好
- 記憶體使用量低，適合小到中型報價單

### 可維護性
- 清晰的類別結構
- 分離的計算邏輯
- 易於擴展的設計模式

### 相依性管理
```python
# 必要套件
pandas>=1.3.0      # Excel 匯出
openpyxl>=3.0.0     # Excel 檔案處理
```

## 部署架構

### GitHub Pages 部署設計

#### 前端架構
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTML 介面     │───▶│  JavaScript     │───▶│  檔案下載       │
│  (報價表單)     │    │  (計算邏輯)     │    │  (Excel/PDF)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 技術選型
- **前端框架**: 純 HTML/CSS/JavaScript (無需 build process)
- **UI 框架**: Bootstrap 5 (CDN)
- **檔案生成**: SheetJS (Excel) + jsPDF (PDF)
- **部署平台**: GitHub Pages

#### 檔案結構
```
/
├── index.html          # 主要介面
├── css/
│   └── style.css      # 自訂樣式
├── js/
│   ├── calculator.js  # 計算邏輯
│   ├── export.js      # 匯出功能
│   └── main.js        # 主要控制邏輯
├── assets/
│   └── logo.png       # 公司 logo
└── README.md          # 專案說明
```

### GitHub Actions 自動部署

#### 工作流程設計
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 部署策略
1. **自動觸發**: 推送到 main 分支時自動部署
2. **測試驗證**: 部署前執行自動化測試
3. **建置優化**: 壓縮 CSS/JS 檔案
4. **快取策略**: 利用 GitHub Actions 快取加速建置

### 前端實作設計

#### 計算邏輯移植
```javascript
class PriceCalculator {
    constructor() {
        this.hourlyRates = {
            "初級開發": 800,
            "中級開發": 1200,
            "高級開發": 1800,
            "架構設計": 2500,
            "專案管理": 1500,
            "UI/UX設計": 1000,
            "測試": 600
        };
        
        this.complexityMultiplier = {
            "簡單": 1.0,
            "中等": 1.3,
            "複雜": 1.8,
            "非常複雜": 2.5
        };
        
        this.riskMultiplier = {
            "低風險": 1.0,
            "中風險": 1.2,
            "高風險": 1.5
        };
    }
    
    calculateItemPrice(taskType, hours, complexity = "中等", risk = "中風險") {
        // JavaScript 版本的計算邏輯
    }
    
    createQuote(projectName, clientName, tasks, additionalCosts = {}) {
        // JavaScript 版本的報價生成
    }
}
```

#### 使用者介面設計
- **響應式設計**: 支援桌面和行動裝置
- **即時計算**: 輸入變更時即時更新價格
- **表單驗證**: 前端輸入驗證和錯誤提示
- **匯出功能**: 支援 Excel 和 PDF 格式下載

#### 資料持久化
- **本地儲存**: 使用 localStorage 儲存報價草稿
- **匯出歷史**: 記錄最近的報價記錄
- **設定儲存**: 儲存使用者自訂的費率設定