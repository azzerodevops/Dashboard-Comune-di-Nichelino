import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-zinc-100">404</h1>
      <p className="text-zinc-400">Pagina non trovata</p>
      <Link href="/dashboard" className="text-blue-400 hover:underline">
        Torna alla dashboard
      </Link>
    </div>
  );
}
