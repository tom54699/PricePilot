// Pure logic module for the web UI to use.
// Keep UI interactions elsewhere.

export class PriceCalculator {
  constructor(taxRate = 0, currency = 'USD') {
    this.taxRate = Number(taxRate) || 0;
    this.currency = currency;
  }

  calculate(tasks = [], additionalCosts = {}) {
    let subtotal = 0;

    for (const t of tasks) {
      const hours = Number(t?.hours ?? 0);
      const rate = Number(t?.rate ?? 0);
      const multiplier = Number(t?.multiplier ?? 1);
      if (hours < 0 || rate < 0 || multiplier < 0) {
        throw new Error('Task values cannot be negative');
      }
      subtotal += hours * rate * multiplier;
    }

    for (const key of Object.keys(additionalCosts || {})) {
      const v = Number(additionalCosts[key]);
      if (v < 0) throw new Error(`Additional cost '${key}' cannot be negative`);
      subtotal += v;
    }

    if (this.taxRate < 0) throw new Error('taxRate cannot be negative');
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}

// Simple global attach for quick manual testing in the browser.
// Avoid relying on this in tests; prefer importing the module.
if (typeof window !== 'undefined') {
  window.PriceCalculator = PriceCalculator;
}

