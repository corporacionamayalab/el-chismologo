import Link from "next/link";

export default function GraciasContactoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">

        <div className="text-7xl mb-6 animate-bounce">💘</div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-rosa to-marca bg-clip-text text-transparent">
          ¡Anuncio enviado!
        </h1>

        <p className="text-sm text-texto-suave mt-4 leading-relaxed">
          Tu anuncio está en revisión. En unos minutos será publicado
          y todos podrán verte 🔍
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contactos"
            className="px-6 py-3 rounded-xl bg-rosa hover:bg-rosa-hover text-white font-semibold transition"
          >
            💘 Ver contactos
          </Link>
          <Link
            href="/contactos/nuevo"
            className="px-6 py-3 rounded-xl border border-rosa text-rosa hover:bg-rosa hover:text-white font-semibold transition"
          >
            + Otro anuncio
          </Link>
        </div>

      </div>
    </main>
  );
}