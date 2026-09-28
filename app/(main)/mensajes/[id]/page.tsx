import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Chat from "@/components/Chat";

export const revalidate = 0;

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (user.id === id) redirect("/mensajes");

  // Verificar que son amigos
  const { data: amistad } = await supabase
    .from("amistades")
    .select("id")
    .or(
      `and(solicitante_id.eq.${user.id},receptor_id.eq.${id}),and(solicitante_id.eq.${id},receptor_id.eq.${user.id})`
    )
    .eq("estado", "aceptada")
    .maybeSingle();

  if (!amistad) redirect("/mensajes");

  // Traer datos del amigo
  const { data: amigo } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, ultima_conexion")
    .eq("id", id)
    .single();

  if (!amigo) notFound();

  // Mensajes entre ambos
  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("*")
    .or(
      `and(emisor_id.eq.${user.id},receptor_id.eq.${id}),and(emisor_id.eq.${id},receptor_id.eq.${user.id})`
    )
    .order("creado_en", { ascending: true })
    .limit(200);

  // Marcar como leídos los que me envió él
  await supabase
    .from("mensajes")
    .update({ leido: true })
    .eq("emisor_id", id)
    .eq("receptor_id", user.id)
    .eq("leido", false);

  return (
    <main className="min-h-screen py-6 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/mensajes"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-4"
        >
          ← Volver a mensajes
        </Link>

        <Chat
          yoId={user.id}
          amigo={amigo}
          mensajesIniciales={mensajes ?? []}
        />

      </div>
    </main>
  );
}