import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { categoryOf, formatPrice, type Listing } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { LANGS, useLang, type Lang } from "@/lib/i18n";
import logoAsset from "@/assets/inkinet-logo.png";
import emblemAsset from "@/assets/sewapoint-emblem.png";

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={emblemAsset}
            alt="Emblème Inkinet"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-black/10"
          />
          <span className="font-display text-xl font-bold">
            Inki<span className="text-accent">net</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link to="/" className="rounded-lg px-3 py-2 hover:bg-muted" activeOptions={{ exact: true }} activeProps={{ className: "bg-muted" }}>{t("Accueil")}</Link>
          <Link to="/a-propos" className="rounded-lg px-3 py-2 hover:bg-muted" activeProps={{ className: "bg-muted" }}>{t("Comment ça marche")}</Link>
          <Link to="/catalogue" className="rounded-lg px-3 py-2 hover:bg-muted" activeProps={{ className: "bg-muted" }}>{t("Catalogue")}</Link>
          <select aria-label={t("Langue")} value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="ml-1 h-9 rounded-lg border bg-card px-2 text-sm">
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.flag} · {l.label}</option>)}
          </select>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="mt-20 bg-brand text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-2">
        <div>
          <img
            src={logoAsset}
            alt="Inkinet — Étudier, Découvrir, Voyager"
            width={208}
            height={175}
            className="w-52 rounded-2xl"
          />
          <p className="mt-4 max-w-md text-sm opacity-90">{t("Votre intermédiaire unique pour l'immobilier, les séjours, les événements, le logement étudiant, l'informatique, la mode et les équipements.")}</p>
        </div>
        <p className="text-sm opacity-90 md:text-right">{t("Toutes les demandes sont traitées directement par l'équipe Inkinet.")}<br />© {new Date().getFullYear()} Inkinet</p>
      </div>
    </footer>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Disponible" ? "bg-primary text-primary-foreground" :
    status === "En réserve" ? "bg-warning text-accent-foreground" :
    status === "Rupture de stock" ? "bg-destructive text-destructive-foreground" :
    "bg-muted-foreground text-primary-foreground";
  const { t } = useLang();
  return <Badge className={cn("border-0", tone)}>{t(status)}</Badge>;
}

export function ListingCard({ l }: { l: Listing }) {
  const cat = categoryOf(l.category);
  const { t } = useLang();
  return (
    <Link to="/annonce/$ref" params={{ ref: l.reference }} className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {l.images[0] && <img src={l.images[0]} alt={l.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        <div className="absolute left-3 top-3 flex gap-2"><StatusBadge status={l.status} />{l.condition && <Badge variant="secondary">{t(l.condition)}</Badge>}</div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(cat?.short ?? "")} · {t(l.subcategory ?? "")}</p>
        <h3 className="mt-1 line-clamp-1 text-lg font-semibold">{l.title}</h3>
        <div className="mt-3 flex items-end justify-between">
          <p className="font-display text-lg font-bold text-primary">{t(formatPrice(l))}</p>
          <span className="text-xs text-muted-foreground">{l.reference}</span>
        </div>
      </div>
    </Link>
  );
}
