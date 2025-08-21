import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Appearance() {
  const [role, setRole] = useState<string>('');
  const [prompt, setPrompt] = useState('Professional, blue/white Optra theme with strong contrast');
  const [tokens, setTokens] = useState<Record<string,string>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const cookie = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);
    setRole(cookie ? decodeURIComponent(cookie[1]) : '');
  }, []);

  const disabled = !(role === 'ADMIN' || role === 'SUPERADMIN') || process.env.NEXT_PUBLIC_FEATURE_FLAG_THEME_AI !== '1';

  async function generate() {
    setMsg('');
    const res = await fetch('/api/settings/theme/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || 'Generate failed'); return; }
    setTokens(data.tokens || {});
  }
  async function apply() {
    setMsg('');
    const res = await fetch('/api/settings/theme/apply', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tokens }) });
    if (!res.ok) { setMsg('Apply failed'); return; }
    setMsg('Applied');
  }
  async function rollback() {
    setMsg('');
    const res = await fetch('/api/settings/theme/rollback', { method:'POST' });
    if (!res.ok) { setMsg('Rollback failed'); return; }
    setMsg('Rolled back');
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src="/public/logo-optra.png" alt="Optra ERP logo" width={22} height={22} />
        Appearance (AI Theme)
      </h1>
      <p>Superadmin/Admin only. Feature flag: FEATURE_FLAG_THEME_AI=1</p>
      <div>
        <label>Prompt</label>
        <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} rows={3} style={{ width:'100%', maxWidth:640 }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={generate} disabled={disabled}>Generate</button>
        <button onClick={apply} disabled={disabled || !Object.keys(tokens).length} style={{ marginLeft:8 }}>Apply</button>
        <button onClick={rollback} disabled={disabled} style={{ marginLeft:8 }}>Rollback</button>
        <Link href="/phase3/preview" style={{ marginLeft: 12 }}>Preview</Link>
      </div>
      {msg && <div role="status" style={{ marginTop: 8 }}>{msg}</div>}
      {!!Object.keys(tokens).length && (
        <section style={{ marginTop: 16 }}>
          <h2>Preview Tokens</h2>
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}


