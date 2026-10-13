CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_range CHECK (end_date >= start_date)
);
GRANT SELECT ON public.reservations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reservations" ON public.reservations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write reservations" ON public.reservations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.requests ADD COLUMN start_date date, ADD COLUMN end_date date, ADD COLUMN status text NOT NULL DEFAULT 'Nouveau';
CREATE POLICY "admin update requests" ON public.requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT UPDATE ON public.requests TO authenticated;

CREATE TABLE public.whatsapp_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  reference text NOT NULL,
  title text,
  action text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'Nouveau',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whatsapp_orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.whatsapp_orders TO authenticated;
GRANT ALL ON public.whatsapp_orders TO service_role;
ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert wa orders" ON public.whatsapp_orders FOR INSERT TO anon, authenticated WITH CHECK (status = 'Nouveau' AND char_length(reference) <= 40);
CREATE POLICY "admin read wa orders" ON public.whatsapp_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update wa orders" ON public.whatsapp_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete wa orders" ON public.whatsapp_orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.check_dates_free()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.start_date IS NULL THEN RETURN NEW; END IF;
  IF NEW.end_date IS NULL THEN NEW.end_date := NEW.start_date; END IF;
  IF NEW.end_date < NEW.start_date THEN RAISE EXCEPTION 'Dates invalides'; END IF;
  IF TG_OP = 'INSERT' AND NEW.start_date < current_date THEN RAISE EXCEPTION 'Dates passées'; END IF;
  IF EXISTS (SELECT 1 FROM public.reservations r WHERE r.listing_id = NEW.listing_id AND r.start_date <= NEW.end_date AND r.end_date >= NEW.start_date) THEN
    RAISE EXCEPTION 'DATES_OCCUPEES';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER requests_dates_free BEFORE INSERT ON public.requests FOR EACH ROW EXECUTE FUNCTION public.check_dates_free();
CREATE TRIGGER wa_orders_dates_free BEFORE INSERT ON public.whatsapp_orders FOR EACH ROW EXECUTE FUNCTION public.check_dates_free();