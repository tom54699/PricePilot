// PriceCalculator for web (spec-aligned)
// Rates and multipliers come from design.md

export class PriceCalculator {
  constructor() {
    // Default labels (display only; not used in pricing)
    this.hourlyRates = {
      初級開發: 800,
      中級開發: 1200,
      高級開發: 1800,
      架構設計: 2500,
      專案管理: 1500,
      'UI/UX設計': 1000,
      測試: 600,
    };

    this.complexityMultiplier = {
      簡單: 1.0,
      中等: 1.3,
      複雜: 1.8,
      非常複雜: 2.5,
    };

    this.riskMultiplier = {
      低風險: 1.0,
      中風險: 1.2,
      高風險: 1.5,
    };

    this.taxRate = 0.05;
    this.baseHourlyRate = 1200; // 僅用此基礎時薪計算，不依賴類型
  }

  validateTaskInput(task) {
    return {
      type: task?.type || '中級開發',
      hours: Math.max(0, Number(task?.hours ?? 0)),
      complexity: task?.complexity || '中等',
      risk: task?.risk || '中風險',
      description: task?.description || '',
    };
  }

  calculateItemPrice(taskType, hours, complexity = '中等', risk = '中風險', description = '') {
    // 類型僅作為標題，不影響價格
    const base = Number(this.baseHourlyRate);
    const h = Math.max(0, Number(hours || 0));
    const c = this.complexityMultiplier[complexity] ?? this.complexityMultiplier['中等'];
    const r = this.riskMultiplier[risk] ?? this.riskMultiplier['中風險'];
    const adjusted = Math.round(base * c * r);
    const subtotal = Math.round(adjusted * h);
    return {
      任務類型: taskType,
      工時: h,
      複雜度: complexity,
      風險等級: risk,
      基礎時薪: base,
      調整後時薪: adjusted,
      小計: subtotal,
      描述: description,
    };
  }

  createQuote(projectName, clientName, tasks, additionalCosts = {}) {
    const items = [];
    for (const raw of tasks || []) {
      const t = this.validateTaskInput(raw);
      items.push(this.calculateItemPrice(t.type, t.hours, t.complexity, t.risk, t.description));
    }

    const devSubtotal = items.reduce((s, it) => s + (it?.小計 || 0), 0);
    const extras = Object.fromEntries(
      Object.entries(additionalCosts || {}).map(([k, v]) => [k, Math.round(Math.max(0, Number(v || 0)))])
    );
    const extraSubtotal = Object.values(extras).reduce((s, v) => s + v, 0);
    const preTax = devSubtotal + extraSubtotal;
    const tax = Math.round(preTax * this.taxRate);
    const total = preTax + tax;

    const today = new Date().toISOString().slice(0, 10);
    return {
      專案名稱: projectName,
      客戶名稱: clientName,
      報價日期: today,
      報價項目: items,
      開發小計: devSubtotal,
      額外費用: { ...extras, 額外費用小計: extraSubtotal },
      稅前總計: preTax,
      營業稅: tax,
      含稅總計: total,
    };
  }
}

if (typeof window !== 'undefined') window.PriceCalculator = PriceCalculator;
