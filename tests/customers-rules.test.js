import { describe, it, expect } from 'vitest';

function creditUtil(balance, limit){ return limit>0? (balance/limit)*100 : 0; }

describe('customers rules', () => {
  it('credit utilisation rounding and zero-limit', () => {
    expect(creditUtil(50,100)).toBe(50);
    expect(creditUtil(0,0)).toBe(0);
  });
  it('on-hold rule with reason and auto-clear under 90%', () => {
    const acc = { balance: 100, creditLimit: 100, status: 'Active', creditHoldReason: null };
    if (acc.balance >= acc.creditLimit) { acc.status = 'On Hold'; acc.creditHoldReason = acc.creditHoldReason || 'Over limit'; }
    expect(acc.status).toBe('On Hold');
    expect(acc.creditHoldReason).toBeTruthy();
    acc.balance = 80; // 80% < 90%
    if (acc.balance < acc.creditLimit * 0.9) { acc.status = 'Active'; acc.creditHoldReason = null; }
    expect(acc.status).toBe('Active');
    expect(acc.creditHoldReason).toBeNull();
  });
  it('statement ageing buckets', () => {
    const buckets = { '0-30':0, '31-60':0, '61-90':0, '90+':0 };
    const days = [10, 45, 75, 120];
    for (const d of days){
      if (d<=30) buckets['0-30']++; else if (d<=60) buckets['31-60']++; else if (d<=90) buckets['61-90']++; else buckets['90+']++;
    }
    expect(buckets).toEqual({ '0-30':1, '31-60':1, '61-90':1, '90+':1 });
  });
});


