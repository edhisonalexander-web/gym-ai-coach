import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { saveProfile } from "@/lib/server/profile";
import { EQUIPMENT, EXPERIENCE, GOALS } from "@/lib/server/types";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  return (
    <AppShell nav={false}>
      <Onboarding />
    </AppShell>
  );
}

function Onboarding() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    age: 28,
    sex: "otro",
    heightCm: 175,
    weightKg: 75,
    goal: "fuerza",
    experience: "principiante",
    daysPerWeek: 3,
    equipment: "peso corporal",
  });

  async function submit() {
    setBusy(true);
    try {
      await saveProfile({ data: form });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil listo");
      navigate({ to: "/" });
    } catch {
      toast.error("No se pudo guardar el perfil");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">Paso {step + 1} de 3</p>
      {step === 0 && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold">Cuéntanos quién eres</h1>
          <div className="mt-8 space-y-4">
            <Field label="Nombre">
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </Field>
            <Field label="Edad">
              <Input
                type="number"
                min={13}
                max={90}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              />
            </Field>
            <Field label="Sexo (para rangos, no se muestra)">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["mujer", "Mujer"],
                  ["hombre", "Hombre"],
                  ["otro", "Otro"],
                ].map(([id, label]) => (
                  <Choice key={id} active={form.sex === id} onClick={() => setForm({ ...form, sex: id })}>
                    {label}
                  </Choice>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estatura (cm)">
                <Input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                />
              </Field>
              <Field label="Peso (kg)">
                <Input
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold">¿Qué buscas?</h1>
          <div className="mt-8 grid gap-2">
            {GOALS.map((g) => (
              <Choice key={g.id} active={form.goal === g.id} onClick={() => setForm({ ...form, goal: g.id })}>
                {g.label}
              </Choice>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">Nivel</p>
          <div className="mt-2 grid gap-2">
            {EXPERIENCE.map((g) => (
              <Choice
                key={g.id}
                active={form.experience === g.id}
                onClick={() => setForm({ ...form, experience: g.id })}
              >
                {g.label}
              </Choice>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold">¿Con qué entrenas?</h1>
          <div className="mt-8 grid gap-2">
            {EQUIPMENT.map((g) => (
              <Choice
                key={g.id}
                active={form.equipment === g.id}
                onClick={() => setForm({ ...form, equipment: g.id })}
              >
                {g.label}
              </Choice>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">Días por semana</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <Choice key={n} active={form.daysPerWeek === n} onClick={() => setForm({ ...form, daysPerWeek: n })}>
                {n}
              </Choice>
            ))}
          </div>
        </>
      )}
      <div className="mt-auto flex gap-2 pt-10">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </Button>
        )}
        {step < 2 ? (
          <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
            Continuar
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => void submit()} disabled={busy}>
            {busy ? "Guardando…" : "Empezar"}
          </Button>
        )}
      </div>
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

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-11 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
          : "h-11 rounded-md bg-secondary px-3 text-sm font-medium text-foreground"
      }
    >
      {children}
    </button>
  );
}
