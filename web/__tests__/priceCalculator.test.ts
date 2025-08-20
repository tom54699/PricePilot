import { describe, it, expect } from 'vitest';
import { PriceCalculator } from '../js/calculator.js';

describe('PriceCalculator (web)', () => {
  it('calculates item and quote using base hourly (type is label-only)', () => {
    const calc = new PriceCalculator();
    // Set base hourly to 1800 so results are comparable to previous spec
    // and ignore type for pricing.
    // Complexity 1.8, Risk 1.5 -> adjusted = 1800 * 1.8 * 1.5 = 4860
    calc.baseHourlyRate = 1800;

    const item = calc.calculateItemPrice('任何類型', 2, '複雜', '高風險');
    expect(item.調整後時薪).toBe(4860);
    expect(item.小計).toBe(9720);

    const quote = calc.createQuote(
      'Proj',
      'Client',
      [
        { type: 'A', hours: 2, complexity: '複雜', risk: '高風險' },
        { type: 'B', hours: 5, complexity: '簡單', risk: '低風險' },
      ],
      { 主機費用: 200 }
    );

    // Second item uses base hourly 1800 * 1.0 * 1.0 = 1800 per hour
    expect(quote.開發小計).toBe(9720 + 1800 * 5);
    expect(quote.額外費用.額外費用小計).toBe(200);
    expect(quote.含稅總計).toBe(quote.稅前總計 + quote.營業稅);
  });
});
