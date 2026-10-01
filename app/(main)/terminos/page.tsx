import Link from "next/link";

export const metadata = {
  title: "Términos de uso — Chismólogo",
};

export default function TerminosPage() {
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
          Términos de uso
        </h1>
        <p className="text-sm text-texto-suave mb-10">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-texto-suave leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">1. Aceptación</h2>
            <p>
              Al usar Chismólogo aceptas estos términos. Si no estás de acuerdo,
              por favor no uses la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">2. Edad mínima</h2>
            <p>
              Debes tener al menos 18 años para usar Chismólogo, especialmente
              para publicar anuncios en la sección Contactos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">3. Contenido prohibido</h2>
            <p className="mb-2">No se permite publicar:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Contenido sexual explícito o pornográfico</li>
              <li>Amenazas, acoso o violencia</li>
              <li>Datos personales de terceros sin su consentimiento</li>
              <li>Spam, publicidad o estafas</li>
              <li>Contenido que involucre a menores</li>
              <li>Promoción de drogas o actividades ilegales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">4. Moderación</h2>
            <p>
              Todas las publicaciones pasan por revisión antes de ser publicadas.
              Nos reservamos el derecho de rechazar cualquier contenido sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">5. Tu cuenta</h2>
            <p>
              Eres responsable de mantener la seguridad de tu cuenta. No compartas
              tu contraseña con nadie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">6. Responsabilidad</h2>
            <p>
              Chismólogo es una plataforma de usuarios. No nos hacemos responsables
              del contenido publicado por terceros ni de las interacciones entre usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">7. Cambios</h2>
            <p>
              Podemos actualizar estos términos en cualquier momento. Los cambios
              importantes serán notificados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">8. Contacto</h2>
            <p>
              Para dudas sobre estos términos, escríbenos a{" "}
                <a
                  href="mailto:elchismoso.confe@gmail.com"
                  className="text-marca hover:text-rosa underline"
                >
                  elchismoso.confe@gmail.com
                </a>
              </p>
          </section>

        </div>

      </div>
    </main>
  );
}