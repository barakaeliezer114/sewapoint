import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MessageCircle, ShieldCheck, CalendarDays, Send, Hash, Landmark, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — SewaPoint" },
      { name: "description", content: "Comprendre SewaPoint : un intermédiaire unique pour réserver, acheter et louer en toute confiance. Fonctionnement, calendrier de disponibilité et demande WhatsApp." },
      { property: "og:title", content: "Comment ça marche — SewaPoint" },
      { property: "og:description", content: "Un seul contact pour tout trouver, réserver et acheter en toute confiance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: APropos,
});

const STEPS = [
  { i: Search, t: "1. Choisissez", d: "Parcourez les annonces et repérez la référence qui vous intéresse." },
  { i: MessageCircle, t: "2. Contactez SewaPoint", d: "Un clic envoie la référence exacte à notre équipe via WhatsApp ou formulaire." },
  { i: ShieldCheck, t: "3. On s'occupe du reste", d: "Nous vérifions, négocions et organisons la liaison en toute sécurité." },
];

function APropos() {
  const { t } = useLang();
  return (
    <>
      <section className="relative overflow-hidden bg-brand text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h1 className="text-4xl font-extrabold md:text-5xl">{t("Comment ça marche")}</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">{t("SewaPoint est votre intermédiaire unique : vous ne contactez jamais les vendeurs ou propriétaires directement. Chaque annonce, chaque réservation et chaque achat passe par notre équipe, qui vérifie, négocie et organise la liaison pour vous.")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold md:text-3xl">{t("En trois étapes")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ i: I, t: ti, d }) => (
            <div key={ti} className="rounded-2xl border bg-card p-6">
              <I className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl font-bold">{t(ti)}</h3>
              <p className="mt-2 text-muted-foreground">{t(d)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold md:text-3xl">{t("Nos univers")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to="/catalogue" search={{ cat: c.id }} className="group flex items-center justify-between rounded-2xl border bg-card p-5 transition hover:border-primary hover:shadow-lg">
              <div>
                <p className="font-semibold">{t(c.label)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.subs.map((s) => t(s)).join(" · ")}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-accent transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-lg font-bold">{t("Le calendrier de disponibilité")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("Pour les maisons, hôtels, salles de fêtes et logements étudiants, chaque fiche affiche un calendrier : les dates déjà occupées sont grisées. Vous choisissez librement vos dates ; si elles sont libres, votre réservation peut être confirmée.")}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Send className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-lg font-bold">{t("Une demande sur WhatsApp")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("Le bouton ouvre WhatsApp avec un message déjà prêt : votre demande, la référence exacte de l'annonce, son titre et son prix. Vous n'avez rien à écrire, il suffit d'appuyer sur Envoyer.")}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Landmark className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-lg font-bold">{t("Le formulaire de demande")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("Vous préférez laisser un message ? Remplissez le formulaire : votre nom, votre téléphone et votre question. L'équipe SewaPoint vous recontacte rapidement.")}</p>
          </div>
        </div>
        <div className="mt-6 flex items-start gap-4 rounded-2xl bg-secondary p-6">
          <Hash className="mt-1 h-6 w-6 shrink-0 text-accent" />
          <p className="text-sm text-muted-foreground md:text-base">{t("Chaque annonce porte une référence unique, par exemple SP-IM001. Notez-la : elle permet à l'équipe de retrouver l'annonce exacte immédiatement.")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-secondary p-8">
          <div>
            <h2 className="text-2xl font-bold">{t("Prêt à commencer ?")}</h2>
            <p className="mt-1 text-muted-foreground">{t("Parcourez le catalogue et contactez-nous en un clic.")}</p>
          </div>
          <Button asChild size="lg"><Link to="/catalogue"><Search /> {t("Explorer le catalogue")}</Link></Button>
        </div>
      </section>
    </>
  );
}
