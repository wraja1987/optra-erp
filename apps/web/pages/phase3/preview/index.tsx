import Head from "next/head";

export default function Phase3Preview() {
  return (
    <>
      <Head>
        <title>Phase 3 Preview</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-optra">Phase 3 Preview</h1>
        <button className="rounded-2xl bg-optra-blue text-white px-6 py-3 shadow hover:opacity-90">
          Install App
        </button>
      </main>
    </>
  );
}
