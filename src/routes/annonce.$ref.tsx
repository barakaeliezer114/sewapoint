import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/site";
import { categoryOf, formatPrice, listingQuery, settingsQuery, whatsappLink } from "@/lib/catalog";
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
  if (!l) return null;
  const cat = categoryOf(l.category);
  const action = cat?.cta ?? "Commander";
  const unavailable = l.status === "Vendu / Occupé" || l.status === "Rupture de stock";
  const features = Array.isArray(l.features) ? (l.features as string[]) : [];
  const embed = l.video_url ? videoEmbed(l.video_url) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = formSchema.safeParse(form);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Formulaire invalide");
    setSending(true);
    const { error } = await supabase.from("requests").insert({ listing_id: l.id, reference: l.reference, name: p.data.name, phone: p.data.phone, message: p.data.message || null });
    setSending(false);
    if (error) return void toast.error("Envoi impossible, réessayez.");
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
            <Button asChild size="lg" disabled={unavailable} className="mt-6 w-full bg-whatsapp text-primary-foreground hover:bg-whatsapp/90">
              <a href={whatsappLink(settings.whatsapp, l, action)} target="_blank" rel="noreferrer"><MessageCircle /> {action} via WhatsApp</a>
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
