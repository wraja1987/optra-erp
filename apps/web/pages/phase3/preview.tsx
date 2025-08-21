import Link from 'next/link';
import PreviewShell from '../../components/PreviewShell';

const tiles: Array<{key:string,label:string,href:string}> = [
  { key:'crm', label:'CRM & Field Service', href:'/phase3/preview/crm' },
  { key:'ai', label:'AI Automation', href:'/phase3/preview/ai' },
  { key:'integrations', label:'Integrations', href:'/phase3/preview/integrations' },
  { key:'global', label:'Global', href:'/phase3/preview/global' },
  { key:'plugins', label:'Plug-ins', href:'/phase3/preview/plugins' },
  { key:'verticals', label:'Verticals', href:'/phase3/preview/verticals' },
  { key:'system', label:'System', href:'/phase3/preview/system' },
];

export default function Phase3Preview() {
  return (
    <PreviewShell>
      <h1 style={{marginTop:0}}>Phase 3 Preview</h1>
      <p>Toggle Theme and Role above. Click a tile to view module previews.</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16}}>
        {tiles.map(t => (
          <Link key={t.key} href={t.href} style={{
            display:'block', padding:16, border:'1px solid var(--border)', borderRadius:8,
            background:'var(--card)', color:'inherit', textDecoration:'none'
          }}>
            <strong>{t.label}</strong>
            <div style={{fontSize:12,opacity:0.8,marginTop:6}}>Preview</div>
          </Link>
        ))}
      </div>
    </PreviewShell>
  );
}


