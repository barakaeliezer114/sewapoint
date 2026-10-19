import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, BedDouble, PartyPopper, GraduationCap, Gamepad2, Shirt, Wrench, ShieldCheck, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/site";
import { CATEGORIES, listingsQuery } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";

const ICONS = { immobilier: Building2, hebergement: BedDouble, evenements: PartyPopper, etudiants: GraduationCap, informatique: Gamepad2, mode: Shirt, equipements: Wrench } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Inkinet — Biens & services via un intermédiaire unique" },
      { name: "description", content: "Maisons, parcelles, hôtels, salles de fêtes, homes étudiants, PC gaming, mode et machines : Inkinet gère chaque demande pour vous." },
      { property: "og:title", content: "Inkinet — Votre intermédiaire unique" },
      { property: "og:description", content: "Un seul contact pour réserver, acheter ou louer en toute confiance." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQuery()),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(listingsQuery());
  const { t } = useLang();
  const tr = t;
  const featured = data.filter((l) => l.featured).slice(0, 6);
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/85 to-brand/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-primary-foreground md:py-32">
          <p className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">{t("Intermédiaire unique")}</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">{t("Un seul contact pour tout trouver, réserver et acheter.")}</h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">{t("Immobilier, séjours, événements, logements étudiants, informatique, mode et équipements. Inkinet traite votre demande et fait la liaison pour vous.")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/catalogue"><Search /> {t("Explorer le catalogue")}</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold">{t("Nos univers")}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <Link key={c.id} to="/catalogue" search={{ cat: c.id }} className="group rounded-2xl border bg-card p-5 transition hover:border-primary hover:shadow-lg">
                <Icon className="h-8 w-8 text-primary transition group-hover:scale-110" />
                <p className="mt-4 font-semibold leading-tight">{t(c.label)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold">{t("À la une")}</h2>
          <Link to="/catalogue" className="text-sm font-semibold text-primary hover:underline">{t("Tout voir →")}</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4">
        <div className="grid gap-6 rounded-3xl bg-secondary p-8 md:grid-cols-3 md:p-12">
          {[
            { i: Search, t: "1. Choisissez", d: "Parcourez les annonces et repérez la référence qui vous intéresse." },
            { i: MessageCircle, t: "2. Contactez Inkinet", d: "Un clic envoie la référence exacte à notre équipe via WhatsApp ou formulaire." },
            { i: ShieldCheck, t: "3. On s'occupe du reste", d: "Nous vérifions, négocions et organisons la liaison en toute sécurité." },
          ].map(({ i: I, t, d }) => (
            <div key={t}><I className="h-8 w-8 text-primary" /><h3 className="mt-3 text-xl font-bold">{tr(t)}</h3><p className="mt-2 text-muted-foreground">{tr(d)}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
