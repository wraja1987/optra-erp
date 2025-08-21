import { useEffect, useState } from 'react';
import Link from 'next/link';
import PreviewShell from '../../../components/PreviewShell';
import { convertBasicMarkdownToHtml } from '../../../lib/md';

export default function ReleaseNotesPreview() {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/release-notes/phase3.md');
        const text = await res.text();
        if (isMounted) setHtml(convertBasicMarkdownToHtml(text));
      } catch {
        if (isMounted) setHtml('<p>Unable to load release notes.</p>');
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <PreviewShell>
      <Link href="/phase3/preview" style={{ fontSize: 12 }}>← Back</Link>
      <h1 style={{ marginTop: 8 }}>Release Notes (Preview)</h1>
      <article style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginTop: 12, background: 'var(--card)' }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </PreviewShell>
  );
}


