import { test, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  AiGovernanceDefaults,
  enforceTenantScope,
  assertSoD,
  compileOpenApi
} = require('./index.js');

test('AI defaults', () => {
  expect(AiGovernanceDefaults.regulatedSubmit).toBe(false);
  expect(AiGovernanceDefaults.tokenCap).toBeGreaterThan(0);
});

test('tenant scoping', () => {
  const ctx = { tenantId: 't1', userRole: 'USER' };
  const good = { tenant_id: 't1', v: 1 };
  const bad  = { tenant_id: 't2', v: 2 };
  expect(enforceTenantScope(ctx, good)).toEqual(good);
  expect(enforceTenantScope(ctx, bad)).toBeNull();
  expect(enforceTenantScope(ctx, null)).toBeNull();
});

test('SoD block for non-super admin', () => {
  const ctx = { tenantId: 't1', userRole: 'USER' };
  expect(() => assertSoD(ctx, 'CHANGE_SUBSCRIPTION')).toThrow();
});

test('OpenAPI stub compiles', () => {
  expect(compileOpenApi()).toBe(true);
});
