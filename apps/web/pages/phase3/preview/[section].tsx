import { useRouter } from 'next/router';
import Link from 'next/link';
import PreviewShell, { usePreviewRole } from '../../../components/PreviewShell';

const sections: Record<string, { title: string; items: string[]; help: string }> = {
  crm: {
    title: 'CRM & Field Service',
    items: ['Leads','Opportunities','Activities','Field Tickets'],
    help: '/docs/crm/overview.mdx',
  },
  ai: {
    title: 'AI Automation',
    items: ['OCR Bills','Predictive Insights'],
    help: '/docs/ai/overview.mdx',
  },
  integrations: {
    title: 'Integrations',
    items: ['Productivity Feeds/Exports','Shopify Pilot'],
    help: '/docs/integrations/overview.mdx',
  },
  global: { title:'Global', items:['Entity Switcher','Consolidation stub'], help:'/docs/global/overview.mdx' },
  plugins: { title:'Plug-ins', items:['Extension Manager stub'], help:'/docs/plugins/overview.mdx' },
  verticals: { title:'Verticals', items:['PLM stub','Maintenance stub'], help:'/docs/verticals/overview.mdx' },
  system: { title:'System', items:['Health/SLA','Config Promotion','SIEM Export','Data Retention'], help:'/docs/system/overview.mdx' },
};

export default function SectionPreview() {
  const { query } = useRouter();
  const key = String(query.section ?? 'crm');
  const cfg = sections[key] ?? sections.crm;
  const role = usePreviewRole();
  return (
    <PreviewShell>
      <Link href="/phase3/preview" style={{fontSize:12}}>← Back</Link>
      <h1 style={{marginTop:8}}>{cfg.title} (Preview)</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16}}>
        {cfg.items.map(s => (
          <div key={s} style={{border:'1px solid var(--border)', borderRadius:8, padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>{s}</strong>
              <Link href={cfg.help} aria-label={`Help for ${s}`}>?</Link>
            </div>
            <p style={{marginTop:8,opacity:0.8}}>High-quality empty state. Use Add to create demo data.</p>
            {(role === 'SUPERADMIN' || role === 'ADMIN') ? (
              <button type="button" aria-label={`Add in ${s}`}>Add</button>
            ) : (
              <div role="note" aria-label="RBAC note" style={{fontSize:12, opacity:0.7}}>This action requires Admin or Superadmin.</div>
            )}
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}


