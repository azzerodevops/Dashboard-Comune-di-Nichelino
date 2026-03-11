import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import type { ProfiloUtente } from "@/lib/supabase/types";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch current user's profile
  const { data: profilo } = await supabase
    .from("profili_utenti")
    .select("*")
    .eq("id", user.id)
    .single();

  // Authorization check
  if (!profilo || profilo.ruolo !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white py-20 shadow-sm">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold text-slate-900">Accesso non autorizzato</h1>
        <p className="text-sm text-slate-500">
          Solo gli utenti con ruolo admin possono accedere a questa pagina.
        </p>
      </div>
    );
  }

  // Fetch all user profiles for the admin panel
  const { data: profili } = await supabase
    .from("profili_utenti")
    .select("*")
    .order("cognome");

  return (
    <AdminPanel profili={(profili ?? []) as ProfiloUtente[]} />
  );
}
