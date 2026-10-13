create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$ begin if not exists (select 1 from public.user_roles where role='admin') then insert into public.user_roles(user_id, role) values (new.id,'admin'); end if; return new; end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.listings (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique default ('SP-' || upper(substr(md5(random()::text),1,6))),
 category text not null, subcategory text, title text not null, description text,
 price numeric, price_unit text, currency text not null default 'USD',
 condition text, status text not null default 'Disponible', location text,
 features jsonb not null default '[]', variants text,
 images text[] not null default '{}', video_url text,
 featured boolean not null default false,
 created_at timestamptz not null default now());
grant select on public.listings to anon, authenticated; grant insert, update, delete on public.listings to authenticated; grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "public read" on public.listings for select to anon, authenticated using (true);
create policy "admin write" on public.listings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.settings (id int primary key default 1, whatsapp text not null default '243000000000', email text, check (id=1));
grant select on public.settings to anon, authenticated; grant update on public.settings to authenticated; grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.settings(id) values (1);

create table public.requests (id uuid primary key default gen_random_uuid(), listing_id uuid, reference text, name text not null, phone text not null, message text, created_at timestamptz not null default now());
grant insert on public.requests to anon, authenticated; grant select, delete on public.requests to authenticated; grant all on public.requests to service_role;
alter table public.requests enable row level security;
create policy "anyone insert" on public.requests for insert to anon, authenticated with check (char_length(name) between 1 and 100 and char_length(phone) between 5 and 30);
create policy "admin read" on public.requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.listings (reference,category,subcategory,title,description,price,price_unit,condition,status,location,features,variants,featured,images) values
('SP-IM001','immobilier','À vendre','Villa 4 chambres avec jardin','Belle villa moderne, quartier calme, titre foncier en règle.',85000,null,null,'Disponible','Lubumbashi, Golf','["4 chambres","3 salles de bain","Jardin 600 m²","Garage 2 voitures"]',null,true,'{https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200}'),
('SP-IM002','immobilier','À louer','Appartement meublé 2 pièces','Appartement lumineux au centre-ville.',450,'/mois',null,'Disponible','Centre-ville','["2 pièces","Meublé","Eau & électricité 24/7"]',null,false,'{https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200}'),
('SP-HB001','hebergement','Hôtels','Suite Standing Vue Lac','Suite tout confort avec petit-déjeuner.',120,'/nuit',null,'Disponible','Bord du lac','["Wi-Fi","Climatisation","Petit-déjeuner"]',null,true,'{https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200}'),
('SP-EV001','evenements','Salles de fêtes','Salle de réception 500 places','Idéale pour mariages et conférences.',1500,'/jour',null,'En réserve','Avenue principale','["500 places","Sonorisation","Parking"]',null,true,'{https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200}'),
('SP-ET001','etudiants','Homes étudiants','Chambre individuelle près du campus','À 5 minutes de l''université.',80,'/mois',null,'Disponible','Campus universitaire','["Chambre individuelle","Wi-Fi","Sécurité 24h"]',null,false,'{https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200}'),
('SP-PC001','informatique','Vente de PC','Laptop Gaming RTX 4060','Processeur i7, 16 Go RAM, SSD 1 To.',1200,null,'Neuf','Disponible',null,'["Intel i7 13e gén.","16 Go RAM","SSD 1 To","RTX 4060"]',null,true,'{https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200}'),
('SP-PC002','informatique','Jeux vidéo PC','Installation pack jeux PC','Installation de vos jeux favoris.',15,'/jeu',null,'Disponible',null,'["Numérique","Installation incluse"]',null,false,'{https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200}'),
('SP-MO001','mode','Chaussures','Baskets urbaines campus','Confortables et tendance.',45,null,'Neuf','Disponible',null,'["Semelle souple","Plusieurs coloris"]','Tailles 39-45 · Noir, Blanc',false,'{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200}'),
('SP-MO002','mode','Accessoires','Sac à dos étudiant','Compartiment laptop 15".',30,null,'Neuf','Rupture de stock',null,'["Imperméable","Port USB"]','Noir, Gris',false,'{https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200}'),
('SP-EQ001','equipements','Générateurs','Générateur diesel 20 kVA','Groupe électrogène robuste, peu servi.',6500,null,'Occasion','Disponible',null,'["20 kVA","Diesel","Démarrage électrique"]',null,true,'{https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200}'),
('SP-HB002','evenements','Sites touristiques','Bungalow resort week-end','Espace détente avec piscine.',200,'/nuit',null,'Vendu / Occupé','Hors ville','["Piscine","Restaurant","Nature"]',null,false,'{https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200}');