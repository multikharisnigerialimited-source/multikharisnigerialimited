ALTER TYPE public.participant_category ADD VALUE IF NOT EXISTS 'minister';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS denomination text;

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.app_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND (key <> 'current_batch' OR value ~ '^[A-Z]$'));
INSERT INTO public.app_settings (key, value) VALUES ('current_batch', 'C') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.next_registration_reference()
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'MNL-' || to_char(now(), 'YYYY')
    || coalesce((SELECT value FROM public.app_settings WHERE key = 'current_batch'), 'A')
    || '-' || lpad(nextval('public.registration_seq')::text, 6, '0')
$$;
ALTER TABLE public.registrations ALTER COLUMN reference SET DEFAULT public.next_registration_reference();