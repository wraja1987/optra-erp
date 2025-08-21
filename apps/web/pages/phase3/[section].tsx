import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { parseRoleFromRequest, isAllowed, requiredRolesFor } from '../../lib/rbac';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const section = String(ctx.params?.section || 'crm');
  const role = parseRoleFromRequest(ctx);
  const required = requiredRolesFor(section);
  if (!isAllowed(role, required)) {
    // 403 + minimal audit log to stdout (API can be added later)
    console.warn(`[RBAC] 403 section=${section} role=${role}`);
    return { notFound: true };
  }
  return { props: { section } };
};

export default function SectionLive({ section }: { section: string }) {
  return (
    <main style={{ padding: 24 }}>
      <Link href="/phase3/preview" style={{ fontSize: 12 }}>← Back</Link>
      <h1 style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/public/logo-optra.png" alt="Optra ERP logo" width={22} height={22} />
        {section.toUpperCase()} (Live)
      </h1>
      <p>High-quality empty state. Use Add to create demo data.</p>
      <button type="button">Add</button>
      <div style={{ marginTop: 8 }}>
        <Link href={`/docs/${section}/overview.mdx`} aria-label="Help">?</Link>
      </div>
    </main>
  );
}


