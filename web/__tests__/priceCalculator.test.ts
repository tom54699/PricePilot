import { describe, it, expect } from 'vitest';
import { PriceCalculator } from '../js/priceCalculator.js';

describe('PriceCalculator (web)', () => {
  it('computes basic totals', () => {
    const calc = new PriceCalculator(0.1, 'USD');
    const result = calc.calculate(
      [
        { name: 'A', hours: 2, rate: 100 },
        { name: 'B', hours: 1, rate: 200, multiplier: 1.5 },
      ],
      { Shipping: 25 }
    );

    // subtotal = 2*100 + 1*200*1.5 + 25 = 200 + 300 + 25 = 525
    // tax = 52.5, total = 577.5
    expect(result.subtotal).toBe(525);
    expect(result.tax).toBe(52.5);
    expect(result.total).toBe(577.5);
  });
});

