import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/site";
import { CATEGORIES, CONDITIONS, STATUSES, categoryOf, listingsQuery } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const search = z.object({ cat: z.string().optional(), sub: z.string().optional(), cond: z.string().optional(), status: z.string().optional() });

export const Route = createFileRoute("/catalogue")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Catalogue SewaPoint — Annonces & services" },
      { name: "description", content: "Filtrez par catégorie, état et disponibilité : immobilier, hébergement, événements, logements étudiants, PC, mode, machines." },
      { property: "og:title", content: "Catalogue SewaPoint" },
      { property: "og:description", content: "Toutes les annonces SewaPoint au même endroit." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQuery()),
  component: Catalogue,
});

const chip = (active: boolean) => cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary");

function Catalogue() {
  const { data } = useSuspenseQuery(listingsQuery());
  const s = Route.useSearch();
  const [q, setQ] = useState("");
  const cat = s.cat ? categoryOf(s.cat) : undefined;
  const items = data.filter((l) =>
    (!s.cat || l.category === s.cat) && (!s.sub || l.subcategory === s.sub) && (!s.cond || l.condition === s.cond) && (!s.status || l.status === s.status) &&
    (!q || `${l.title} ${l.reference} ${l.description ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">{cat?.label ?? "Tout le catalogue"}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/catalogue" search={{}} className={chip(!s.cat)}>Tout</Link>
        {CATEGORIES.map((c) => <Link key={c.id} to="/catalogue" search={{ cat: c.id }} className={chip(s.cat === c.id)}>{c.short}</Link>)}
      </div>
      {cat && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cat.subs.map((sub) => <Link key={sub} to="/catalogue" search={{ ...s, sub: s.sub === sub ? undefined : sub }} className={chip(s.sub === sub)}>{sub}</Link>)}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input placeholder="Rechercher un titre ou une référence…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        <select className="h-9 rounded-md border bg-card px-3 text-sm" value={s.cond ?? ""} onChange={(e) => (window.location.search = new URLSearchParams({ ...clean(s), cond: e.target.value }).toString())}>
          <option value="">Neuf & Occasion</option>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-card px-3 text-sm" value={s.status ?? ""} onChange={(e) => (window.location.search = new URLSearchParams({ ...clean(s), status: e.target.value }).toString())}>
          <option value="">Tous les statuts</option>{STATUSES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{items.length} résultat(s)</span>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => <ListingCard key={l.id} l={l} />)}
      </div>
      {items.length === 0 && <p className="mt-16 text-center text-muted-foreground">Aucune annonce ne correspond à ces filtres.</p>}
    </div>
  );
}

function clean(o: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Record<string, string>;
}
