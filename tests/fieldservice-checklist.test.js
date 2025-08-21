import { describe, it, expect } from 'vitest';
import * as FieldService from '../apps/api/src/fieldservice/checklist.service.js';

describe('Fieldservice checklist', () => {
  it('create/add/complete happy path', () => {
    const c = FieldService.createOfflineChecklist('J1');
    expect(c.offline).toBe(true);
    const c2 = FieldService.addItem(c, 'Check Oil');
    expect(c2.items.length).toBe(1);
    const c3 = FieldService.complete(c2, 'tech');
    expect(c3.status).toBe('DONE');
    expect(c3.offline).toBe(false);
  });
  it('slaTimer returns ISO string', () => {
    const t = FieldService.slaTimer('2024-01-01T00:00:00.000Z', 30);
    expect(typeof t).toBe('string');
    expect(t.includes('T')).toBe(true);
  });
});




