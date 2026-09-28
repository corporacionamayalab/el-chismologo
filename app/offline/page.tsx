/* eslint-disable @next/next/no-html-link-for-pages */
export const metadata = {
  title: 'Sin conexión — Chismólogo',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="text-7xl mb-6">👀</div>
      <h1 className="text-3xl font-bold text-white mb-3">
        Sin conexión
      </h1>
      <p className="text-white/90 mb-8 max-w-sm">
        No tienes internet en este momento. Revisa tu conexión y vuelve a intentarlo.
      </p>
      <a
        href="/"
        className="px-6 py-3 rounded-full bg-white text-purple-700 font-semibold shadow-lg hover:scale-105 transition"
      >
        Reintentar
      </a>
    </main>
  );
}