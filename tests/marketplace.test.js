import { describe, it, expect } from 'vitest';
import * as Store from '../apps/api/src/marketplace/storefront.service.js';
import * as Skills from '../apps/api/src/marketplace/skills.service.js';

describe('Marketplace services', () => {
  it('searchApps filters by name and category, handles empty', () => {
    const apps = [
      { id:'a', name:'Alpha CRM', category:'Sales' },
      { id:'b', name:'Beta ERP', category:'Ops' },
    ];
    expect(Store.searchApps(apps, '')).toHaveLength(2);
    expect(Store.searchApps(apps, 'crm')).toHaveLength(1);
    expect(Store.searchApps(apps, 'ops')).toHaveLength(1);
    expect(Store.searchApps(apps, 'zzz')).toHaveLength(0);
  });
  it('install/uninstall/list lifecycle', () => {
    const registry = new Map();
    expect(Store.installApp(registry, { id:'a', name:'Alpha' })).toBe(true);
    expect(Store.listInstalled(registry)).toHaveLength(1);
    expect(Store.uninstallApp(registry, 'a')).toBe(true);
    expect(Store.uninstallApp(registry, 'a')).toBe(false);
  });
  it('skills register/enforce with token caps', () => {
    const skill = Skills.registerSkill('app1', 'summarize', 100);
    expect(skill.tokenCap).toBe(100);
    expect(Skills.enforceSkillCall(skill, 50)).toBe(true);
  });
});




