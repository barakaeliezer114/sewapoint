import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Home, Languages, LayoutGrid, Menu, MessageCircle, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categoryOf, formatPrice, settingsQuery, type Listing } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { LANGS, useLang } from "@/lib/i18n";
import logoAsset from "@/assets/inkinet-logo.png";
import emblemAsset from "@/assets/sewapoint-emblem.png";

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const { data: settings, isPending, isError } = useQuery({ ...settingsQuery(), enabled: open });
  const phone = settings?.whatsapp?.replace(/\D/g, "");
  const conversationUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent("Bonjour Inkinet 👋, je souhaite avoir des renseignements sur vos services.")}` : undefined;
  const navigation = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/a-propos", label: "Comment ça marche", icon: CircleHelp },
    { to: "/catalogue", label: "Catalogue", icon: LayoutGrid },
  ] as const;
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
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" aria-label={t("Ouvrir le menu")} className="h-10 gap-2 px-3">
              <Menu aria-hidden="true" /> <span>{t("Menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent aria-describedby={undefined} className="flex w-[min(24rem,100vw)] flex-col overflow-y-auto p-5 sm:max-w-sm">
            <SheetHeader className="border-b pb-5 text-left">
              <SheetTitle className="font-display text-xl">Inkinet · {t("Menu")}</SheetTitle>
            </SheetHeader>
            <nav aria-label={t("Menu")} className="space-y-2 py-4">
              {navigation.map(({ to, label, icon: Icon }) => (
                <Button key={to} asChild variant="ghost" className="h-auto min-h-12 w-full justify-start whitespace-normal px-3 py-3 text-left">
                  <Link to={to} onClick={() => setOpen(false)} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-primary" }}>
                    <Icon aria-hidden="true" /> <span className="min-w-0 flex-1">{t(label)}</span><ChevronRight aria-hidden="true" />
                  </Link>
                </Button>
              ))}
            </nav>
            <div className="border-y py-5">
              {conversationUrl ? (
                <Button asChild className="h-auto min-h-12 w-full whitespace-normal py-3">
                  <a href={conversationUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <MessageCircle aria-hidden="true" /> {t("Conversation WhatsApp")}
                  </a>
                </Button>
              ) : (
                <Button disabled className="h-auto min-h-12 w-full whitespace-normal py-3">
                  <MessageCircle aria-hidden="true" /> {t(isPending ? "Chargement…" : "Conversation indisponible")}
                </Button>
              )}
              {isError && <p role="status" className="mt-2 text-sm text-muted-foreground">{t("Contact indisponible, réessayez.")}</p>}
            </div>
            <fieldset className="py-5">
              <legend className="flex items-center gap-2 text-sm font-semibold"><Languages className="h-4 w-4" aria-hidden="true" />{t("Langue")}</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {LANGS.map((l) => (
                  <Button key={l.id} variant={lang === l.id ? "secondary" : "outline"} aria-pressed={lang === l.id} onClick={() => setLang(l.id)} className="h-11 min-w-0 justify-between px-3">
                    <span lang={l.id}>{l.label}</span>{lang === l.id && <Check aria-hidden="true" />}
                  </Button>
                ))}
              </div>
            </fieldset>
          </SheetContent>
        </Sheet>
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
