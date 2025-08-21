import Link from 'next/link';
import { modelLabels, orderedModels } from '../lib/modelLabels';

export default function SidebarModels() {
  return (
    <nav style={{padding:12,minWidth:280}}>
      <h3 style={{margin:'0 0 8px'}}>All Models</h3>
      <div style={{margin:'8px 0 12px'}}> 
        <Link href="/phase3/preview" style={{fontWeight:600}}>Phase 3 Preview</Link>
      </div>
      <ul style={{listStyle:'none',padding:0,margin:0}}>
        {orderedModels.map(key => (
          <li key={key} style={{margin:'6px 0'}}>
            <Link href={`/models/${key}`} style={{textDecoration:'none'}}>
              {modelLabels[key] ?? key}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
