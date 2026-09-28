import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeartbeatConexion from "@/components/HeartbeatConexion";
import SessionTimeout from "@/components/SessionTimeout";
import AvisoBloqueado from "@/components/AvisoBloqueado";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <HeartbeatConexion />
      <SessionTimeout />
      <AvisoBloqueado />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}