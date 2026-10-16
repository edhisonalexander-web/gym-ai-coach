import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/server/profile";
import {
  formatSubscriptionDate,
  getPremiumOffer,
  getPremiumState,
  isNativeMobile,
  PREMIUM_PRICE,
  purchasePremium,
  restorePremium,
  type PremiumOffer,
} from "@/lib/mobile/revenuecat";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

const FREE = ["3 sesiones de cámara al día", "Biblioteca completa", "1 plan de IA", "Historial básico"];
const PRO = [
  "Sesiones de cámara ilimitadas",
  "Planes semanales ilimitados",
  "Estadísticas avanzadas",
  "Cues de voz y correcciones",
  "Prioridad en nuevas detecciones",
];

function PremiumPage() {
  return (
    <AppShell>
      <Premium />
    </AppShell>
  );
}

function Premium() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [offer, setOffer] = useState<PremiumOffer | null>(null);
  const [mobilePremium, setMobilePremium] = useState(false);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const native = isNativeMobile();
  const userId = profile.data?.userId;
  // On mobile, RevenueCat is the source of truth for store purchases. The
  // server flag is retained only for the non-native preview/backend flow.
  const isPremium = native ? mobilePremium : Boolean(profile.data?.isPremium);

  useEffect(() => {
    if (!native || !userId) return;
    let cancelled = false;
    void Promise.all([getPremiumOffer(userId), getPremiumState(userId)])
      .then(([nextOffer, state]) => {
        if (cancelled) return;
        setOffer(nextOffer);
        setMobilePremium(state.isPremium);
        setExpirationDate(state.expirationDate);
      })
      .catch(() => {
        if (!cancelled) toast.error("No pudimos cargar la oferta Premium de prueba");
      });
    return () => {
      cancelled = true;
    };
  }, [native, userId]);

  async function buy() {
    if (!userId || !offer) return;
    setLoading(true);
    try {
      const state = await purchasePremium(userId, offer.package);
      setMobilePremium(state.isPremium);
      setExpirationDate(state.expirationDate);
      toast.success("Premium activado en tu cuenta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la compra");
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    if (!userId) return;
    setRestoring(true);
    try {
      const state = await restorePremium(userId);
      setMobilePremium(state.isPremium);
      setExpirationDate(state.expirationDate);
      toast.success(state.isPremium ? "Tu compra fue restaurada" : "No encontramos una compra activa");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron restaurar las compras");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <div className="flex items-center gap-2 text-primary">
        <Crown className="size-4" />
        <p className="text-xs font-medium tracking-[0.18em] uppercase">Gym AI Coach Premium</p>
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Entrena con un instructor siempre disponible</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Más sesiones, planes adaptados y seguimiento completo de tu técnica por $9.99 al mes.
      </p>

      <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-border)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase opacity-75">Plan mensual</p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight">{offer?.priceLabel ?? PREMIUM_PRICE}</p>
            <p className="mt-1 text-sm opacity-80">Se renueva automáticamente cada mes</p>
          </div>
          <Sparkles className="size-6" />
        </div>
        {isPremium ? (
          <div className="mt-5 rounded-xl bg-black/15 p-3 text-sm">
            <p className="font-semibold">Premium activo</p>
            {expirationDate && <p className="mt-1 opacity-80">Activo hasta {formatSubscriptionDate(expirationDate)}</p>}
          </div>
        ) : (
          <Button
            className="mt-5 w-full bg-background text-foreground hover:bg-background/90"
            size="lg"
            onClick={() => void buy()}
            disabled={!native || !offer || loading || !userId}
          >
            {loading ? "Procesando compra…" : native ? "Probar Premium por $9.99/mes" : "Disponible en la app móvil"}
          </Button>
        )}
        {native && !isPremium && <p className="mt-3 text-center text-xs opacity-75">Compra segura mediante la tienda de tu dispositivo</p>}
      </div>

      <section className="mt-5 grid gap-3">
        <FeatureCard title="Gratis" subtitle="Para empezar" items={FREE} muted />
        <FeatureCard title="Premium" subtitle="Para progresar sin límites" items={PRO} />
      </section>

      <div className="mt-5 rounded-xl bg-secondary p-4 text-sm">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">Tú mantienes el control</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              Las compras se procesan en Google Play o App Store. No guardamos datos de tarjeta en Gym AI Coach.
            </p>
          </div>
        </div>
      </div>

      {native && (
        <Button variant="ghost" className="mt-3 w-full" onClick={() => void restore()} disabled={restoring || !userId}>
          <RotateCcw className="size-4" />
          {restoring ? "Restaurando…" : "Restaurar compras"}
        </Button>
      )}

      {!native && (
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          Esta vista ya está diseñada. La compra se activa cuando la aplicación se ejecuta como Android o iOS y se conecta al proyecto RevenueCat.
        </p>
      )}
    </main>
  );
}

function FeatureCard({ title, subtitle, items, muted = false }: { title: string; subtitle: string; items: string[]; muted?: boolean }) {
  return (
    <article className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {!muted && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">$9.99/mes</span>}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className={`mt-0.5 size-4 shrink-0 ${muted ? "text-muted-foreground" : "text-primary"}`} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
