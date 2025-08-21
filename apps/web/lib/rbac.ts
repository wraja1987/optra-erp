import type { GetServerSidePropsContext } from 'next';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'STAFF';

export function parseRoleFromRequest(ctx: GetServerSidePropsContext): Role | null {
  const cookie = ctx.req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)role=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]).toUpperCase();
  if (value === 'SUPERADMIN' || value === 'ADMIN' || value === 'STAFF') return value as Role;
  return null;
}

export function isAllowed(role: Role | null, required: Role | Role[]): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  if (!role) return false;
  if (role === 'SUPERADMIN') return true;
  return requiredList.includes(role);
}

export function requiredRolesFor(section: string, slug?: string): Role | Role[] {
  // Defaults: Staff can view CRM and read-only modules; Admin for most; System requires Superadmin
  switch (section) {
    case 'crm':
    case 'field':
      return ['ADMIN', 'STAFF'];
    case 'ai':
    case 'integrations':
    case 'global':
    case 'plugins':
    case 'verticals':
      return ['ADMIN'];
    case 'system':
      return ['SUPERADMIN'];
    default:
      return ['ADMIN'];
  }
}


