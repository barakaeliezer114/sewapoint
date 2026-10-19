import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/site";
import { CATEGORIES, CONDITIONS, STATUSES, categoryOf, listingsQuery } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

const search = z.object({ cat: z.string().optional(), sub: z.string().optional(), cond: z.string().optional(), status: z.string().optional(), min: z.coerce.number().optional(), max: z.coerce.number().optional() });

export const Route = createFileRoute("/catalogue")({
  validateSearch: search,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Catalogue Inkinet — Annonces & services" },
      { name: "description", content: "Filtrez par catégorie, état et disponibilité : immobilier, hébergement, événements, logements étudiants, PC, mode, machines." },
      { property: "og:title", content: "Catalogue Inkinet" },
      { property: "og:description", content: "Toutes les annonces Inkinet au même endroit." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQuery()),
  component: Catalogue,
});

const chip = (active: boolean) => cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary");

function Catalogue() {
  const { data } = useSuspenseQuery(listingsQuery());
  const s = Route.useSearch();
  const { t } = useLang();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const upd = (k: string, v: string) => navigate({ search: (p) => ({ ...p, [k]: v === "" ? undefined : v }) as never, replace: true });
  const cat = s.cat ? categoryOf(s.cat) : undefined;
  const items = data.filter((l) =>
    (!s.cat || l.category === s.cat) && (!s.sub || l.subcategory === s.sub) && (!s.cond || l.condition === s.cond) && (!s.status || l.status === s.status) &&
    (s.min == null || (l.price != null && Number(l.price) >= s.min)) && (s.max == null || (l.price != null && Number(l.price) <= s.max)) &&
    (!q || `${l.title} ${l.reference} ${l.description ?? ""} ${l.location ?? ""} ${l.subcategory ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">{t(cat?.label ?? "Tout le catalogue")}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/catalogue" search={{}} className={chip(!s.cat)}>{t("Tout")}</Link>
        {CATEGORIES.map((c) => <Link key={c.id} to="/catalogue" search={{ cat: c.id }} className={chip(s.cat === c.id)}>{t(c.short)}</Link>)}
      </div>
      {cat && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cat.subs.map((sub) => <Link key={sub} to="/catalogue" search={{ ...s, sub: s.sub === sub ? undefined : sub }} className={chip(s.sub === sub)}>{t(sub)}</Link>)}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input placeholder={t("Rechercher un titre ou une référence…")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        <select className="h-9 rounded-md border bg-card px-3 text-sm" value={s.cond ?? ""} onChange={(e) => upd("cond", e.target.value)}>
          <option value="">{t("Neuf & Occasion")}</option>{CONDITIONS.map((c) => <option key={c} value={c}>{t(c)}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-card px-3 text-sm" value={s.status ?? ""} onChange={(e) => upd("status", e.target.value)}>
          <option value="">{t("Tous les statuts")}</option>{STATUSES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
        </select>
        <Input type="number" min="0" placeholder={t("Prix min")} defaultValue={s.min ?? ""} onBlur={(e) => upd("min", e.target.value)} className="w-28 bg-card" />
        <Input type="number" min="0" placeholder={t("Prix max")} defaultValue={s.max ?? ""} onBlur={(e) => upd("max", e.target.value)} className="w-28 bg-card" />
        <span className="text-sm text-muted-foreground">{items.length} {t("résultat(s)")}</span>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => <ListingCard key={l.id} l={l} />)}
      </div>
      {items.length === 0 && <p className="mt-16 text-center text-muted-foreground">{t("Aucune annonce ne correspond à ces filtres.")}</p>}
    </div>
  );
}

