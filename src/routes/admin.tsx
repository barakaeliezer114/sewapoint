import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Trash2, Pencil, LogOut } from "lucide-react";
import emblemAsset from "@/assets/sewapoint-emblem.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/site";
import { CATEGORIES, CONDITIONS, STATUSES, formatPrice, listingsQuery, settingsQuery, ORDER_STATUSES, BOOKABLE, type Listing } from "@/lib/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Administration — Inkinet" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Tableau de bord Inkinet : annonces, statuts, demandes et WhatsApp." },
      { property: "og:title", content: "Administration Inkinet" },
      { property: "og:description", content: "Espace de gestion Inkinet." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const sel = "h-9 w-full rounded-md border bg-card px-3 text-sm";

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle().then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (session === undefined) return <p className="py-24 text-center text-muted-foreground">Chargement…</p>;
  if (!session) return <AuthForm />;
  if (isAdmin === null) return <p className="py-24 text-center text-muted-foreground">Vérification…</p>;
  if (!isAdmin)
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Accès réservé à l'administrateur</h1>
        <Button variant="outline" className="mt-4" onClick={() => supabase.auth.signOut()}>Se déconnecter</Button>
      </div>
    );
  return <Dashboard email={session.user.email ?? ""} />;
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error, data } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) return void toast.error(error.message);
    if (mode === "up" && !data.session) toast.success("Vérifiez votre e-mail pour confirmer le compte.");
  };
  return (
    <form onSubmit={submit} className="mx-auto my-20 max-w-sm space-y-4 rounded-2xl border bg-card p-8">
      <img src={emblemAsset} alt="Inkinet" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl object-cover ring-1 ring-black/10" />
      <h1 className="text-2xl font-bold">{mode === "in" ? "Connexion admin" : "Créer le compte admin"}</h1>
      <p className="text-sm text-muted-foreground">Le premier compte créé devient l'administrateur Inkinet.</p>
      <Input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" required minLength={6} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button className="w-full" disabled={busy}>{mode === "in" ? "Se connecter" : "Créer le compte"}</Button>
      <button type="button" className="w-full text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Pas encore de compte ? Créer" : "Déjà un compte ? Se connecter"}
      </button>
    </form>
  );
}

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data: listings = [] } = useQuery(listingsQuery());
  const [editing, setEditing] = useState<Listing | null>(null);
  const [tab, setTab] = useState("list");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["listings"] }); qc.invalidateQueries({ queryKey: ["listing"] }); };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) return void toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("listings").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold">Dashboard Inkinet</h1><p className="text-sm text-muted-foreground">{email}</p></div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}><LogOut /> Déconnexion</Button>
      </div>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v !== "form") setEditing(null); }} className="mt-8">
        <TabsList>
          <TabsTrigger value="list">Annonces ({listings.length})</TabsTrigger>
          <TabsTrigger value="form">{editing ? "Modifier" : "Nouvelle annonce"}</TabsTrigger>
          <TabsTrigger value="orders">Commandes WhatsApp</TabsTrigger>
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6 space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-3">
              {l.images[0] ? <img src={l.images[0]} alt="" className="h-16 w-20 rounded-lg object-cover" /> : <div className="h-16 w-20 rounded-lg bg-muted" />}
              <div className="min-w-0 flex-1">
                <Link to="/annonce/$ref" params={{ ref: l.reference }} className="font-semibold hover:underline">{l.title}</Link>
                <p className="text-xs text-muted-foreground">{l.reference} · {l.category} · {formatPrice(l)}</p>
              </div>
              <StatusBadge status={l.status} />
              <select className="h-9 rounded-md border bg-card px-2 text-sm" value={l.status} onChange={(e) => setStatus(l.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setTab("form"); }}><Pencil /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 /></Button>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="form" className="mt-6">
          <ListingForm key={editing?.id ?? "new"} initial={editing} onDone={() => { refresh(); setEditing(null); setTab("list"); }} />
        </TabsContent>
        <TabsContent value="orders" className="mt-6"><Orders /></TabsContent>
        <TabsContent value="requests" className="mt-6"><Requests /></TabsContent>
        <TabsContent value="calendar" className="mt-6"><Reservations listings={listings.filter((l) => BOOKABLE.includes(l.category))} /></TabsContent>
        <TabsContent value="settings" className="mt-6"><Settings /></TabsContent>
      </Tabs>
    </div>
  );
}

async function upload(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2) throw e2;
  return data.signedUrl;
}

function ListingForm({ initial, onDone }: { initial: Listing | null; onDone: () => void }) {
  const [f, setF] = useState({
    category: initial?.category ?? "immobilier", subcategory: initial?.subcategory ?? "", title: initial?.title ?? "", description: initial?.description ?? "",
    price: initial?.price?.toString() ?? "", price_unit: initial?.price_unit ?? "", currency: initial?.currency ?? "USD", condition: initial?.condition ?? "",
    status: initial?.status ?? "Disponible", location: initial?.location ?? "", features: Array.isArray(initial?.features) ? (initial!.features as string[]).join("\n") : "",
    variants: initial?.variants ?? "", video_url: initial?.video_url ?? "", featured: initial?.featured ?? false,
  });
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [busy, setBusy] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === f.category)!;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const onImages = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    try { const urls = await Promise.all(Array.from(files).map(upload)); setImages((p) => [...p, ...urls]); } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };
  const onVideo = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setBusy(true);
    try { const url = await upload(files[0]); setF((p) => ({ ...p, video_url: url })); } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return void toast.error("Titre requis");
    const row = {
      category: f.category, subcategory: f.subcategory || null, title: f.title.trim().slice(0, 200), description: f.description || null,
      price: f.price ? Number(f.price) : null, price_unit: f.price_unit || null, currency: f.currency || "USD", condition: f.condition || null,
      status: f.status, location: f.location || null, features: f.features.split("\n").map((x) => x.trim()).filter(Boolean),
      variants: f.variants || null, video_url: f.video_url || null, featured: f.featured, images,
    };
    setBusy(true);
    const { error } = initial ? await supabase.from("listings").update(row).eq("id", initial.id) : await supabase.from("listings").insert(row);
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success(initial ? "Annonce mise à jour" : "Annonce publiée");
    onDone();
  };

  return (
    <form onSubmit={save} className="grid gap-5 rounded-2xl border bg-card p-6 md:grid-cols-2">
      <div><Label>Catégorie</Label><select className={sel} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, subcategory: "" })}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
      <div><Label>Sous-catégorie</Label><select className={sel} value={f.subcategory} onChange={set("subcategory")}><option value="">—</option>{cat.subs.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="md:col-span-2"><Label>Titre</Label><Input value={f.title} onChange={set("title")} maxLength={200} /></div>
      <div className="md:col-span-2"><Label>Description</Label><Textarea rows={4} value={f.description} onChange={set("description")} /></div>
      <div className="grid grid-cols-3 gap-2"><div><Label>Prix</Label><Input type="number" min="0" value={f.price} onChange={set("price")} /></div><div><Label>Devise</Label><Input value={f.currency} onChange={set("currency")} /></div><div><Label>Unité</Label><Input placeholder="/mois" value={f.price_unit} onChange={set("price_unit")} /></div></div>
      <div className="grid grid-cols-2 gap-2"><div><Label>État</Label><select className={sel} value={f.condition} onChange={set("condition")}><option value="">—</option>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div><div><Label>Statut</Label><select className={sel} value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div></div>
      <div><Label>Localisation</Label><Input value={f.location} onChange={set("location")} /></div>
      <div><Label>Variantes (tailles, couleurs)</Label><Input value={f.variants} onChange={set("variants")} /></div>
      <div className="md:col-span-2"><Label>Caractéristiques (une par ligne)</Label><Textarea rows={4} value={f.features} onChange={set("features")} /></div>
      <div className="md:col-span-2">
        <Label>Photos</Label>
        <Input type="file" accept="image/*" multiple onChange={(e) => onImages(e.target.files)} />
        <div className="mt-3 flex flex-wrap gap-2">{images.map((src) => (
          <div key={src} className="relative"><img src={src} alt="" className="h-20 w-28 rounded-lg object-cover" /><button type="button" onClick={() => setImages(images.filter((x) => x !== src))} className="absolute right-1 top-1 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">✕</button></div>
        ))}</div>
      </div>
      <div className="md:col-span-2"><Label>Vidéo (lien YouTube ou fichier)</Label><div className="flex gap-2"><Input placeholder="https://youtube.com/…" value={f.video_url} onChange={set("video_url")} /><Input type="file" accept="video/*" className="max-w-56" onChange={(e) => onVideo(e.target.files)} /></div></div>
      <label className="flex items-center gap-3"><Switch checked={f.featured} onCheckedChange={(v) => setF({ ...f, featured: v })} /> Mettre à la une</label>
      <div className="md:col-span-2"><Button disabled={busy} size="lg">{busy ? "Patientez…" : initial ? "Enregistrer" : "Publier l'annonce"}</Button></div>
    </form>
  );
}

function Requests() {
  const { data = [], refetch } = useQuery({ queryKey: ["requests"], queryFn: async () => (await supabase.from("requests").select("*").order("created_at", { ascending: false })).data ?? [] });
  if (!data.length) return <p className="text-muted-foreground">Aucune demande pour l'instant.</p>;
  return (
    <div className="space-y-3">{data.map((r) => (
      <div key={r.id} className="flex flex-wrap items-start gap-4 rounded-xl border bg-card p-4">
        <div className="flex-1"><p className="font-semibold">{r.name} · <a className="text-primary" href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{r.phone}</a></p>
          <p className="text-sm">Réf. {r.reference && <Link to="/annonce/$ref" params={{ ref: r.reference }} className="font-mono underline">{r.reference}</Link>}</p>
          {r.start_date && <p className="text-sm">Dates : {fmtD(r.start_date)} → {fmtD(r.end_date ?? r.start_date)}</p>}
          {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</p></div>
        <select className="h-9 rounded-md border bg-card px-2 text-sm" value={r.status} onChange={async (e) => { await supabase.from("requests").update({ status: e.target.value }).eq("id", r.id); refetch(); }}>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
        {r.start_date && r.listing_id && <Button size="sm" variant="outline" onClick={async () => {
          const { error } = await supabase.from("reservations").insert({ listing_id: r.listing_id!, start_date: r.start_date!, end_date: r.end_date ?? r.start_date!, note: `Demande de ${r.name}` });
          if (error) return void toast.error(error.message);
          await supabase.from("requests").update({ status: "Confirmée" }).eq("id", r.id); refetch(); toast.success("Dates bloquées dans le calendrier");
        }}>Bloquer les dates</Button>}
        <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("requests").delete().eq("id", r.id); refetch(); }}><Trash2 /></Button>
      </div>))}
    </div>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery());
  const [wa, setWa] = useState("");
  useEffect(() => { if (data) setWa(data.whatsapp); }, [data]);
  const save = async () => {
    const clean = wa.replace(/\D/g, "");
    if (clean.length < 8) return void toast.error("Numéro invalide (format international, ex. 243812345678)");
    const { error } = await supabase.from("settings").update({ whatsapp: clean }).eq("id", 1);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["settings"] });
    toast.success("Numéro WhatsApp enregistré");
  };
  return (
    <div className="max-w-md space-y-3 rounded-2xl border bg-card p-6">
      <Label>Numéro WhatsApp de l'administrateur</Label>
      <Input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="243812345678" />
      <p className="text-xs text-muted-foreground">Format international sans « + ». Tous les boutons d'action ouvrent une conversation vers ce numéro.</p>
      <Button onClick={save}>Enregistrer</Button>
    </div>
  );
}

const fmtD = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("fr-FR");

function Orders() {
  const { data = [], refetch } = useQuery({ queryKey: ["wa_orders"], queryFn: async () => (await supabase.from("whatsapp_orders").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [filter, setFilter] = useState("");
  const rows = data.filter((o) => !filter || o.status === filter);
  const update = async (id: string, status: string) => { const { error } = await supabase.from("whatsapp_orders").update({ status }).eq("id", id); if (error) toast.error(error.message); refetch(); };
  return (
    <div className="space-y-3">
      <select className="h-9 rounded-md border bg-card px-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Tous les statuts ({data.length})</option>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
      {!rows.length && <p className="text-muted-foreground">Aucune commande WhatsApp enregistrée.</p>}
      {rows.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold"><Link to="/annonce/$ref" params={{ ref: o.reference }} className="font-mono underline">{o.reference}</Link> · {o.title}</p>
            <p className="text-sm text-muted-foreground">{o.action} · {new Date(o.created_at).toLocaleString("fr-FR")}{o.start_date && ` · ${fmtD(o.start_date)} → ${fmtD(o.end_date ?? o.start_date)}`}</p>
          </div>
          <select className="h-9 rounded-md border bg-card px-2 text-sm" value={o.status} onChange={(e) => update(o.id, e.target.value)}>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          <Button size="icon" variant="ghost" onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("whatsapp_orders").delete().eq("id", o.id); refetch(); }}><Trash2 /></Button>
        </div>
      ))}
    </div>
  );
}

function Reservations({ listings }: { listings: Listing[] }) {
  const qc = useQueryClient();
  const [lid, setLid] = useState(listings[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const { data = [], refetch } = useQuery({ queryKey: ["reservations", lid], enabled: !!lid, queryFn: async () => (await supabase.from("reservations").select("*").eq("listing_id", lid).order("start_date")).data ?? [] });
  const done = () => { refetch(); qc.invalidateQueries({ queryKey: ["reservations", lid] }); };
  const add = async () => {
    if (!start) return void toast.error("Date de début requise");
    const { error } = await supabase.from("reservations").insert({ listing_id: lid, start_date: start, end_date: end || start });
    if (error) return void toast.error(error.message);
    setStart(""); setEnd(""); done();
  };
  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
      <Label>Annonce</Label>
      <select className={sel} value={lid} onChange={(e) => setLid(e.target.value)}>{listings.map((l) => <option key={l.id} value={l.id}>{l.reference} — {l.title}</option>)}</select>
      <div className="flex flex-wrap items-end gap-2">
        <div><Label>Du</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><Label>Au</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        <Button onClick={add}>Marquer occupé</Button>
      </div>
      {data.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
          <span>{fmtD(r.start_date)} → {fmtD(r.end_date)}{r.note && ` · ${r.note}`}</span>
          <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("reservations").delete().eq("id", r.id); done(); }}><Trash2 /></Button>
        </div>
      ))}
      {lid && !data.length && <p className="text-sm text-muted-foreground">Aucune date occupée.</p>}
    </div>
  );
}
