import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getProfile, saveProfile } from "@/lib/server/profile";
import { EQUIPMENT, EXPERIENCE, GOALS } from "@/lib/server/types";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <AppShell>
      <Profile />
    </AppShell>
  );
}

function Profile() {
  const user = useCurrentUser();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [form, setForm] = useState({
    displayName: "",
    age: 28,
    sex: "otro",
    heightCm: 175,
    weightKg: 75,
    goal: "fuerza",
    experience: "principiante",
    daysPerWeek: 3,
    equipment: "peso corporal",
    voiceCues: true,
  });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const p = q.data;
    if (!p) return;
    setForm({
      displayName: p.displayName ?? user?.displayName ?? "",
      age: p.age ?? 28,
      sex: p.sex ?? "otro",
      heightCm: p.heightCm ?? 175,
      weightKg: p.weightKg ?? 75,
      goal: p.goal ?? "fuerza",
      experience: p.experience ?? "principiante",
      daysPerWeek: p.daysPerWeek,
      equipment: p.equipment,
      voiceCues: p.voiceCues,
    });
  }, [q.data, user]);

  const save = useMutation({
    mutationFn: () => saveProfile({ data: form }),
    onSuccess: () => {
      toast.success("Perfil actualizado");
      void qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("No se pudo guardar"),
  });

  const label = form.displayName || user?.displayName || user?.primaryEmail || "Atleta";

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <div className="flex items-center gap-3">
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-14 rounded-full object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-secondary font-display text-lg">
            {initials(label)}
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold">{label}</h1>
          <p className="text-xs text-muted-foreground">{user?.primaryEmail}</p>
        </div>
      </div>

      <Link
        to="/premium"
        className="mt-6 flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]"
      >
        <span>{q.data?.isPremium ? "Plan Premium activo" : "Pasar a Premium"}</span>
        <span className="text-primary">{q.data?.isPremium ? "Activo" : "Ver"}</span>
      </Link>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Nombre">
          <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Edad">
            <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </Field>
          <Field label="cm">
            <Input
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
            />
          </Field>
          <Field label="kg">
            <Input
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
            />
          </Field>
        </div>
        <Field label="Objetivo">
          <select
            className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
          >
            {GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nivel">
          <select
            className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          >
            {EXPERIENCE.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Equipo">
          <select
            className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm"
            value={form.equipment}
            onChange={(e) => setForm({ ...form, equipment: e.target.value })}
          >
            {EQUIPMENT.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Días por semana">
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, daysPerWeek: n })}
                className={
                  form.daysPerWeek === n
                    ? "h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground"
                    : "h-11 rounded-md bg-secondary text-sm font-medium"
                }
              >
                {n}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex h-11 items-center justify-between rounded-md bg-secondary px-3 text-sm">
          Cues de voz
          <input
            type="checkbox"
            checked={form.voiceCues}
            onChange={(e) => setForm({ ...form, voiceCues: e.target.checked })}
          />
        </label>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>

      <Button
        variant="ghost"
        className="mt-6 w-full"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut("/").catch(() => setSigningOut(false));
        }}
      >
        {signingOut ? "Saliendo…" : "Cerrar sesión"}
      </Button>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
