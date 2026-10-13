import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Listing = Tables<"listings">;

export const CATEGORIES = [
  { id: "immobilier", label: "Immobilier & Terrains", short: "Immobilier", subs: ["À vendre", "À louer"], cta: "Demander une visite" },
  { id: "hebergement", label: "Hébergement & Séjours", short: "Hébergement", subs: ["Hôtels", "Auberges & Résidences"], cta: "Réserver" },
  { id: "evenements", label: "Événements & Loisirs", short: "Événements", subs: ["Salles de fêtes", "Sites touristiques"], cta: "Réserver" },
  { id: "etudiants", label: "Logements Étudiants", short: "Étudiants", subs: ["Homes étudiants", "Cités étudiantes"], cta: "Réserver" },
  { id: "informatique", label: "Gaming & Informatique", short: "Gaming & PC", subs: ["Jeux vidéo PC", "Vente de PC"], cta: "Acheter" },
  { id: "mode", label: "Mode & Style Étudiant", short: "Mode", subs: ["Chaussures", "Vêtements", "Accessoires"], cta: "Commander" },
  { id: "equipements", label: "Équipements & Machines", short: "Équipements", subs: ["Générateurs", "Machines", "Outillage"], cta: "Commander" },
] as const;

export const STATUSES = ["Disponible", "En réserve", "Rupture de stock", "Vendu / Occupé"] as const;
export const CONDITIONS = ["Neuf", "Occasion"] as const;

export const categoryOf = (id: string) => CATEGORIES.find((c) => c.id === id);

export const formatPrice = (l: Pick<Listing, "price" | "currency" | "price_unit">) =>
  l.price == null ? "Prix sur demande" : `${Number(l.price).toLocaleString("fr-FR")} ${l.currency}${l.price_unit ? " " + l.price_unit : ""}`;

export const listingsQuery = () =>
  queryOptions({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const listingQuery = (ref: string) =>
  queryOptions({
    queryKey: ["listing", ref],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("reference", ref).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

export function whatsappLink(phone: string, l: Pick<Listing, "reference" | "title" | "price" | "currency" | "price_unit">, action: string) {
  const msg = `Bonjour SewaPoint 👋\nJe souhaite : ${action}\n\nRéférence : ${l.reference}\nArticle : ${l.title}\nPrix : ${formatPrice(l)}\n\nMerci de me recontacter.`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}
