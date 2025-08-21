import { describe, it, expect } from 'vitest';
import * as MfgGenealogy from '../apps/api/src/mfg/genealogy.service.js';

describe('MFG genealogy service', () => {
  it('buildGenealogy builds parent links', () => {
    const moves = [
      { parentLot:'P1', childLot:'C1', qty:1 },
      { parentLot:'P2', childLot:'C1', qty:2 },
      { parentLot:'P3', childLot:'C2', qty:1 }
    ];
    const g = MfgGenealogy.buildGenealogy(moves);
    expect(g.get('C1').length).toBe(2);
    expect(g.get('C2')[0].parentLot).toBe('P3');
  });

  it('buildGenealogy handles empty input', () => {
    const g = MfgGenealogy.buildGenealogy([]);
    expect(g instanceof Map).toBe(true);
    expect(g.size).toBe(0);
  });
});




