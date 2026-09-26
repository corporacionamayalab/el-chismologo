import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">

        <div className="text-8xl mb-6 animate-bounce">
          👀
        </div>

        <h1 className="text-6xl md:text-7xl font-black gradient-animated">
          404
        </h1>

        <p className="text-xl font-bold text-texto mt-4">
          Aquí no hay nada que chismear
        </p>

        <p className="text-sm text-texto-suave mt-3 leading-relaxed">
          La página que buscas no existe o fue movida.
          Pero no te preocupes, hay muchos chismes esperándote.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-105 shadow-lg shadow-marca/20"
          >
            🏠 Volver al inicio
          </Link>
          <Link
            href="/confesiones"
            className="px-6 py-3 rounded-xl border border-marca text-marca hover:bg-marca hover:text-white font-semibold transition"
          >
            📝 Ver confesiones
          </Link>
        </div>

      </div>
    </main>
  );
}