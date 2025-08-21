import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  // Load applied theme tokens (if any)
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch('/theme.json', { cache: 'no-store' });
        if (!res.ok) return;
        const tokens = await res.json();
        const root = document.documentElement.style as CSSStyleDeclaration;
        for (const [k, v] of Object.entries(tokens || {})) {
          root.setProperty(`--${k}`, String(v));
        }
      } catch {}
    }
    loadTheme();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b5fff" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}


