import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { categoryOf, formatPrice, type Listing } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/sewapoint-logo.png.asset.json";
import emblemAsset from "@/assets/sewapoint-emblem.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={emblemAsset.url}
            alt="Emblème SewaPoint"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-black/10"
          />
          <span className="font-display text-xl font-bold">
            Sewa<span className="text-accent">Point</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link to="/" className="rounded-lg px-3 py-2 hover:bg-muted" activeOptions={{ exact: true }} activeProps={{ className: "bg-muted" }}>Accueil</Link>
          <Link to="/catalogue" className="rounded-lg px-3 py-2 hover:bg-muted" activeProps={{ className: "bg-muted" }}>Catalogue</Link>
          <Link to="/admin" className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-2">
        <div>
          <img
            src={logoAsset.url}
            alt="SewaPoint — Étudier, Découvrir, Voyager"
            width={208}
            height={175}
            className="w-52 rounded-2xl"
          />
          <p className="mt-4 max-w-md text-sm opacity-90">Votre intermédiaire unique pour l'immobilier, les séjours, les événements, le logement étudiant, l'informatique, la mode et les équipements.</p>
        </div>
        <p className="text-sm opacity-90 md:text-right">Toutes les demandes sont traitées directement par l'équipe SewaPoint.<br />© {new Date().getFullYear()} SewaPoint</p>
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
  return <Badge className={cn("border-0", tone)}>{status}</Badge>;
}

export function ListingCard({ l }: { l: Listing }) {
  const cat = categoryOf(l.category);
  return (
    <Link to="/annonce/$ref" params={{ ref: l.reference }} className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {l.images[0] && <img src={l.images[0]} alt={l.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        <div className="absolute left-3 top-3 flex gap-2"><StatusBadge status={l.status} />{l.condition && <Badge variant="secondary">{l.condition}</Badge>}</div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat?.short} · {l.subcategory}</p>
        <h3 className="mt-1 line-clamp-1 text-lg font-semibold">{l.title}</h3>
        <div className="mt-3 flex items-end justify-between">
          <p className="font-display text-lg font-bold text-primary">{formatPrice(l)}</p>
          <span className="text-xs text-muted-foreground">{l.reference}</span>
        </div>
      </div>
    </Link>
  );
}
