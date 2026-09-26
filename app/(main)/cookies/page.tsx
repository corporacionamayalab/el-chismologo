import Link from "next/link";

export const metadata = {
  title: "Política de cookies — Chismólogo",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-8"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl md:text-5xl font-black gradient-animated mb-2">
          Política de cookies
        </h1>
        <p className="text-sm text-texto-suave mb-10">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-texto-suave leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">1. ¿Qué son las cookies?</h2>
            <p>
              Son pequeños archivos que se guardan en tu navegador para recordar
              información sobre tu visita.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">2. Cookies que usamos</h2>
            <div className="bg-fondo-card border border-borde rounded-xl p-4 space-y-3">
              <div>
                <p className="font-semibold text-texto">🔐 Cookies de sesión</p>
                <p className="text-sm">
                  Necesarias para mantener tu sesión activa. Sin ellas, no podrías
                  iniciar sesión.
                </p>
              </div>
              <div>
                <p className="font-semibold text-texto">⚙️ Cookies de preferencias</p>
                <p className="text-sm">
                  Guardan tus preferencias (como el tema oscuro).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">3. Cookies que NO usamos</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>❌ Cookies de publicidad</li>
              <li>❌ Cookies de rastreo de terceros</li>
              <li>❌ Cookies de redes sociales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">4. Cómo desactivarlas</h2>
            <p>
              Puedes desactivar las cookies desde la configuración de tu navegador.
              Si las desactivas, no podrás iniciar sesión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">5. Contacto</h2>
            <p>
              Para dudas sobre cookies:{" "}
              <a
                href="mailto:hola@chismologo.online"
                className="text-marca hover:text-rosa underline"
              >
                hola@chismologo.online
              </a>
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}