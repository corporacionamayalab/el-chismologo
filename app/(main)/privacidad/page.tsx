import Link from "next/link";

export const metadata = {
  title: "Política de privacidad — Chismólogo",
};

export default function PrivacidadPage() {
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
          Política de privacidad
        </h1>
        <p className="text-sm text-texto-suave mb-10">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-texto-suave leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">1. Datos que recopilamos</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Email y contraseña (encriptada) al registrarte</li>
              <li>Nombre de usuario</li>
              <li>Contenido que publicas (confesiones, anuncios, mensajes)</li>
              <li>Dirección IP (solo para contadores de vistas)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">2. Cómo usamos tus datos</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Para que puedas iniciar sesión y usar la plataforma</li>
              <li>Para mostrar tu contenido a otros usuarios</li>
              <li>Para moderar el contenido</li>
              <li>Para mejorar el servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">3. Confesiones anónimas</h2>
            <p>
              Aunque publiques una confesión anónima, en nuestra base de datos
              guardamos tu identidad real por seguridad. Los demás usuarios no la ven.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">4. Compartir con terceros</h2>
            <p>
              NO vendemos tus datos. Solo los compartimos con proveedores
              necesarios para el servicio (Supabase, Resend, Vercel).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">5. Tus derechos</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Eliminar tu cuenta cuando quieras</li>
              <li>Editar tu información personal</li>
              <li>Reportar contenido inapropiado</li>
              <li>Solicitar una copia de tus datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">6. Cookies</h2>
            <p>
              Usamos cookies para mantener tu sesión activa. No usamos cookies
              de publicidad ni de rastreo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">7. Seguridad</h2>
            <p>
              Usamos encriptación y medidas de seguridad para proteger tus datos.
              Aún así, ningún sistema es 100% infalible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-texto mb-3">8. Contacto</h2>
            <p>
              Para ejercer tus derechos o dudas:{" "}
              <a
                href="mailto:privacidad@chismologo.online"
                className="text-marca hover:text-rosa underline"
              >
                privacidad@chismologo.online
              </a>
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}