import fs from 'fs';
import path from 'path';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { convertBasicMarkdownToHtml } from '../../../lib/md';

type ReleaseNoteEntry = { slug: string; html: string };

export default function ReleaseNotesPage({ entries }: { entries: ReleaseNoteEntry[] }) {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Head>
        <title>Release Notes — Optra ERP</title>
      </Head>
      <h1 style={{ marginBottom: 16 }}>Release Notes</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Latest updates are shown first. Visible to all roles.</p>
      {entries.map((entry) => (
        <article key={entry.slug} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16, background: 'var(--card)' }}>
          <div dangerouslySetInnerHTML={{ __html: entry.html }} />
        </article>
      ))}
    </main>
  );
}

export const getStaticProps: GetStaticProps<{ entries: ReleaseNoteEntry[] }> = async () => {
  const releaseNotesDir: string = path.join(process.cwd(), 'public', 'release-notes');
  let entries: ReleaseNoteEntry[] = [];
  try {
    const fileNames: string[] = fs.existsSync(releaseNotesDir) ? fs.readdirSync(releaseNotesDir) : [];
    const mdFiles: string[] = fileNames.filter((f) => f.toLowerCase().endsWith('.md'));
    const withContent = mdFiles.map((fileName) => {
      const filePath = path.join(releaseNotesDir, fileName);
      const raw = fs.readFileSync(filePath, 'utf8');
      return { slug: fileName.replace(/\.md$/i, ''), raw };
    });
    // Sort by filename descending so phase3 > phase2, or by mtime if needed
    withContent.sort((a, b) => b.slug.localeCompare(a.slug, undefined, { numeric: true, sensitivity: 'base' }));
    entries = withContent.map(({ slug, raw }) => ({ slug, html: convertBasicMarkdownToHtml(raw) }));
  } catch {
    entries = [];
  }
  return { props: { entries } };
};


