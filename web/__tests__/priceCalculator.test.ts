import { describe, it, expect } from 'vitest';
import { PriceCalculator } from '../js/calculator.js';

describe('PriceCalculator (web)', () => {
  it('calculates item and quote per spec', () => {
    const calc = new PriceCalculator();
    const item = calc.calculateItemPrice('高級開發', 2, '複雜', '高風險');
    // base 1800 * 1.8 * 1.5 = 4860 adjusted; subtotal = 9720
    expect(item.調整後時薪).toBe(4860);
    expect(item.小計).toBe(9720);

    const quote = calc.createQuote(
      'Proj',
      'Client',
      [
        { type: '高級開發', hours: 2, complexity: '複雜', risk: '高風險' },
        { type: '測試', hours: 5, complexity: '簡單', risk: '低風險' },
      ],
      { 主機費用: 200 }
    );

    expect(quote.開發小計).toBe(9720 + 600 * 5);
    expect(quote.額外費用.額外費用小計).toBe(200);
    expect(quote.含稅總計).toBe(quote.稅前總計 + quote.營業稅);
  });
});
