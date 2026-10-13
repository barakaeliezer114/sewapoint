import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/site";
import { BOOKABLE, categoryOf, formatPrice, isRangeFree, listingQuery, reservationsQuery, settingsQuery, whatsappLink } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/annonce/$ref")({
  loader: async ({ context, params }) => {
    const [l] = await Promise.all([context.queryClient.ensureQueryData(listingQuery(params.ref)), context.queryClient.ensureQueryData(settingsQuery())]);
    if (!l) throw notFound();
    return { title: l.title, desc: l.description, img: l.images[0] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — SewaPoint` },
          { name: "description", content: loaderData.desc ?? "Annonce SewaPoint" },
          { property: "og:title", content: `${loaderData.title} — SewaPoint` },
          { property: "og:description", content: loaderData.desc ?? "Annonce SewaPoint" },
          ...(loaderData.img?.startsWith("https://") ? [{ property: "og:image", content: loaderData.img }, { name: "twitter:image", content: loaderData.img }] : []),
        ]
      : [{ title: "Annonce introuvable — SewaPoint" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center"><h1 className="text-2xl font-bold">Annonce introuvable</h1><Link to="/catalogue" className="mt-4 inline-block text-primary underline">Retour au catalogue</Link></div>
  ),
  component: Detail,
});

const formSchema = z.object({ name: z.string().trim().min(1, "Nom requis").max(100), phone: z.string().trim().min(5, "Téléphone invalide").max(30), message: z.string().trim().max(1000) });

function videoEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : null;
}

function Detail() {
  const { ref } = Route.useParams();
  const { data: l } = useSuspenseQuery(listingQuery(ref));
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const { data: occupied = [] } = useQuery({ ...reservationsQuery(l?.id ?? ""), enabled: !!l });
  if (!l) return null;
  const bookable = BOOKABLE.includes(l.category);
  const iso = (d: Date) => format(d, "yyyy-MM-dd");
  const occ = occupied.map((o) => ({ start: o.start_date, end: o.end_date }));
  const sel = range?.from ? { start: iso(range.from), end: iso(range.to ?? range.from) } : null;
  const selFree = !sel || isRangeFree(sel, occ);
  const datesLabel = sel ? `${format(range!.from!, "d MMM yyyy", { locale: fr })} → ${format(range!.to ?? range!.from!, "d MMM yyyy", { locale: fr })}` : undefined;
  const isOccupied = (d: Date) => !isRangeFree({ start: iso(d), end: iso(d) }, occ);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const datesOk = () => {
    if (!bookable) return true;
    if (!sel) { toast.error("Choisissez vos dates dans le calendrier."); return false; }
    if (!selFree) { toast.error("Ces dates sont déjà occupées."); return false; }
    return true;
  };
  const orderWhatsapp = async () => {
    if (unavailable || !datesOk()) return;
    const w = window.open("", "_blank");
    const { error } = await supabase.from("whatsapp_orders").insert({ listing_id: l.id, reference: l.reference, title: l.title, action, start_date: sel?.start ?? null, end_date: sel?.end ?? null });
    if (error) { w?.close(); return void toast.error(error.message.includes("DATES_OCCUPEES") ? "Ces dates sont déjà occupées." : "Envoi impossible, réessayez."); }
    const url = whatsappLink(settings.whatsapp, l, action, datesLabel);
    if (w) w.location.href = url; else window.location.href = url;
  };
  const cat = categoryOf(l.category);
  const action = cat?.cta ?? "Commander";
  const unavailable = l.status === "Vendu / Occupé" || l.status === "Rupture de stock";
  const features = Array.isArray(l.features) ? (l.features as string[]) : [];
  const embed = l.video_url ? videoEmbed(l.video_url) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = formSchema.safeParse(form);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Formulaire invalide");
    if (!datesOk()) return;
    setSending(true);
    const { error } = await supabase.from("requests").insert({ listing_id: l.id, reference: l.reference, name: p.data.name, phone: p.data.phone, message: p.data.message || null, start_date: sel?.start ?? null, end_date: sel?.end ?? null });
    setSending(false);
    if (error) return void toast.error(error.message.includes("DATES_OCCUPEES") ? "Ces dates sont déjà occupées." : "Envoi impossible, réessayez.");
    toast.success("Demande envoyée ! SewaPoint vous recontacte rapidement.");
    setForm({ name: "", phone: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/catalogue" search={{ cat: l.category }} className="text-sm text-muted-foreground hover:text-primary">← {cat?.label}</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            {l.images[active] && <img src={l.images[active]} alt={l.title} className="h-full w-full object-cover" />}
          </div>
          {l.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {l.images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {l.video_url && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Vidéo de présentation</h2>
              <div className="mt-3 aspect-video overflow-hidden rounded-2xl bg-foreground">
                {embed ? <iframe src={embed} title="Vidéo" className="h-full w-full" allowFullScreen /> : <video src={l.video_url} controls className="h-full w-full" />}
              </div>
            </div>
          )}
          {l.description && <div className="mt-8"><h2 className="text-xl font-bold">Description</h2><p className="mt-3 whitespace-pre-line text-muted-foreground">{l.description}</p></div>}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap gap-2"><StatusBadge status={l.status} />{l.condition && <Badge variant="secondary">{l.condition}</Badge>}<Badge variant="outline">{l.subcategory}</Badge></div>
            <h1 className="mt-4 text-3xl font-extrabold">{l.title}</h1>
            {l.location && <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{l.location}</p>}
            <p className="mt-4 font-display text-3xl font-bold text-primary">{formatPrice(l)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Référence : <span className="font-mono font-semibold">{l.reference}</span></p>
            {features.length > 0 && <ul className="mt-5 space-y-2">{features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul>}
            {l.variants && <p className="mt-4 text-sm"><span className="font-semibold">Variantes :</span> {l.variants}</p>}
            {bookable && (
              <div className="mt-6 rounded-xl border p-3">
                <p className="text-sm font-semibold">Disponibilité — choisissez vos dates</p>
                <Calendar mode="range" locale={fr} selected={range} onSelect={setRange} disabled={[{ before: today }, isOccupied]}
                  modifiers={{ booked: isOccupied }} modifiersClassNames={{ booked: "line-through text-destructive" }} className="mx-auto" />
                <p className="text-xs text-muted-foreground"><span className="text-destructive line-through">12</span> = date occupée</p>
                {datesLabel && <p className={`mt-1 text-sm ${selFree ? "text-success" : "text-destructive"}`}>{datesLabel}{selFree ? "" : " — dates occupées"}</p>}
              </div>
            )}
            <Button size="lg" disabled={unavailable || !selFree} onClick={orderWhatsapp} className="mt-6 w-full bg-whatsapp text-primary-foreground hover:bg-whatsapp/90">
              <MessageCircle /> {action} via WhatsApp
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Votre demande est reçue directement par l'administrateur SewaPoint.</p>
          </div>
          <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-6">
            <h2 className="font-bold">Ou laissez une demande</h2>
            <Input placeholder="Votre nom" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Téléphone / WhatsApp" value={form.phone} maxLength={30} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Textarea placeholder="Message (dates, taille, questions…)" value={form.message} maxLength={1000} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" className="w-full" disabled={sending}>{sending ? "Envoi…" : `${action} — envoyer à SewaPoint`}</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
