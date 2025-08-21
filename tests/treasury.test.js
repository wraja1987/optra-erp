import { describe, it, expect } from 'vitest';
import * as Treasury from '../apps/api/src/treasury/treasury.service.js';

describe('Treasury service', () => {
  it('cashForecast handles empty arrays', () => {
    expect(Treasury.cashForecast([], [])).toBe(0);
  });
  it('cashForecast sums correctly', () => {
    expect(Treasury.cashForecast([10, 5], [3, 2])).toBe(10);
  });
  it('fxExposure aggregates per currency', () => {
    const pos = [
      { ccy: 'USD', amount: 10 },
      { ccy: 'EUR', amount: 5 },
      { ccy: 'USD', amount: -2 },
    ];
    const res = Treasury.fxExposure(pos);
    expect(res.USD).toBe(8);
    expect(res.EUR).toBe(5);
  });
  it('intercompanyNetting nets values', () => {
    expect(Treasury.intercompanyNetting([5, -2, 1]).net).toBe(4);
  });
});


