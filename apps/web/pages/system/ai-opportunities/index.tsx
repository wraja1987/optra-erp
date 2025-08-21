import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Opp = { id:number; slug:string; title:string; category:string; valueScore:number; effort:string; risk?:string };

export default function AiOpportunities() {
  const [items, setItems] = useState<Opp[]>([]);
  const [category, setCategory] = useState('');
  const [effort, setEffort] = useState('');
  const [minValue, setMinValue] = useState(0);
  const [selected, setSelected] = useState<Opp|null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => { void refresh(); }, []);

  async function refresh() {
    setStatus('');
    const ok = await fetch('/api/ai/opportunities/refresh', { method:'POST' });
    if (!ok.ok) { setStatus('Refresh denied'); return; }
    await load();
  }
  async function load() {
    const url = `/api/ai/opportunities?${new URLSearchParams({ category, effort, minValue:String(minValue) })}`;
    const res = await fetch(url);
    if (!res.ok) { setStatus('Load denied'); return; }
    const data = await res.json();
    setItems(data.items || []);
  }
  async function createPlan(id:number) {
    setStatus('');
    const res = await fetch(`/api/ai/opportunities/${id}/plan`, { method:'POST' });
    const data = await res.json();
    if (!res.ok) { setStatus('Plan denied'); return; }
    const confirmed = window.confirm('Confirm apply plan?');
    if (!confirmed) return;
    const resApply = await fetch(`/api/ai/opportunities/${id}/accept`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan: data.plan }) });
    if (!resApply.ok) { setStatus('Accept failed'); return; }
    setStatus('Accepted');
  }
  async function reject(id:number) {
    const reason = window.prompt('Reason for rejection?') || '';
    const res = await fetch(`/api/ai/opportunities/${id}/reject`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) });
    if (!res.ok) { setStatus('Reject failed'); return; }
    setStatus('Rejected');
  }

  const filtered = useMemo(() => items, [items]);

  return (
    <main style={{ padding:24, color:'var(--fg,#0b0d14)', background:'var(--bg,#fff)' }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src="/public/logo-optra.png" alt="Optra ERP logo" width={22} height={22} />
        AI Opportunities
      </h1>
      <p>Super Admin only. Feature flag: FEATURE_AI_OPPORTUNITIES=1</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <label>Category</label>
        <select value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">All</option><option>Module</option><option>Integration</option><option>Feature</option></select>
        <label>Effort</label>
        <select value={effort} onChange={(e)=>setEffort(e.target.value)}><option value="">All</option><option>S</option><option>M</option><option>L</option></select>
        <label>Min value</label>
        <input type="number" value={minValue} onChange={(e)=>setMinValue(Number(e.target.value))} style={{ width:90 }} />
        <button onClick={load}>Filter</button>
        <button onClick={refresh}>Refresh</button>
        <Link href="/docs/system/ai-opportunities/overview.mdx" style={{ marginLeft:8 }} aria-label="Help">?</Link>
      </div>
      {status && <div role="status" style={{ marginTop:8 }}>{status}</div>}
      <div role="table" style={{ marginTop:16, border:'1px solid var(--border,#e1e6ef)', borderRadius:6 }}>
        <div role="row" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'8px 12px', background:'var(--surface,#f8fafc)', fontWeight:600 }}>
          <div>Title</div><div>Category</div><div>Value</div><div>Effort</div>
        </div>
        {filtered.map(it => (
          <button key={it.id} role="row" onClick={()=>setSelected(it)} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 12px', border:'none', borderTop:'1px solid var(--border,#e1e6ef)', textAlign:'left', background:'transparent', cursor:'pointer' }}>
            <div>{it.title}</div><div>{it.category}</div><div>{it.valueScore}</div><div>{it.effort}</div>
          </button>
        ))}
      </div>
      {selected && (
        <aside aria-label="Opportunity details" style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(520px,90vw)', background:'var(--surface,#f8fafc)', borderLeft:'1px solid var(--border,#e1e6ef)', padding:16 }}>
          <h2 style={{ marginTop:0 }}>{selected.title}</h2>
          <p>Category: {selected.category} • Value: {selected.valueScore} • Effort: {selected.effort} • Risk: {selected.risk || 'n/a'}</p>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>createPlan(selected.id)}>Create plan</button>
            <button onClick={()=>reject(selected.id)}>Reject</button>
            <button onClick={()=>setSelected(null)} aria-label="Close">Close</button>
          </div>
        </aside>
      )}
    </main>
  );
}


