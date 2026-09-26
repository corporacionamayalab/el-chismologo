import Link from "next/link";

export default function GraciasPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">

        <div className="text-7xl mb-6 animate-bounce">🎉</div>

        <h1 className="text-3xl font-bold gradient-animated">
          ¡Confesión enviada!
        </h1>

        <p className="text-sm text-texto-suave mt-4 leading-relaxed">
          Tu confesión está en revisión. En unos minutos será publicada
          y todos podrán verla 👀
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/confesiones"
            className="px-6 py-3 rounded-xl bg-marca hover:bg-marca-hover text-white font-semibold transition"
          >
            📝 Ver confesiones
          </Link>
          <Link
            href="/confesiones/nueva"
            className="px-6 py-3 rounded-xl border border-marca text-marca hover:bg-marca hover:text-white font-semibold transition"
          >
            + Otra confesión
          </Link>
        </div>

      </div>
    </main>
  );
}