import { describe, it, expect } from 'vitest';
import * as Quality from '../apps/api/src/quality/quality.service.js';

describe('Quality service', () => {
  it('applyHold sets hold flags', () => {
    const res = Quality.applyHold({ id: 1 }, 'reason');
    expect(res.hold).toBe(true);
    expect(res.holdReason).toBe('reason');
  });
  it('linkCapa returns object with timestamps', () => {
    const res = Quality.linkCapa('NC1', 'fix');
    expect(res.ncId).toBe('NC1');
    expect(typeof res.createdAt).toBe('string');
  });
  it('supplierScore happy path', () => {
    const score = Quality.supplierScore(90, 2000);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  it('supplierScore handles invalid', () => {
    const score = Quality.supplierScore(undefined, undefined);
    expect(typeof score).toBe('number');
  });
});




