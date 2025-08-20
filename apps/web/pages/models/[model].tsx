import { useRouter } from 'next/router';
import SidebarModels from '../../components/SidebarModels';
import { modelLabels } from '../../lib/modelLabels';

export default function ModelPage() {
  const { query } = useRouter();
  const key = String(query.model || '');
  return (
    <div style={{display:'flex',gap:24,padding:16}}>
      <SidebarModels />
      <main>
        <h2>{modelLabels[key] ?? key}</h2>
        <p>Coming soon: data grid for {key}.</p>
      </main>
    </div>
  );
}
