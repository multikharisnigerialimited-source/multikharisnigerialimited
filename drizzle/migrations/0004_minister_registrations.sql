CREATE TABLE public.minister_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT public.next_registration_reference(),
  name text NOT NULL,
  title text NOT NULL,
  church text NOT NULL,
  gender text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  amount_due integer NOT NULL DEFAULT 0,
  amount_paid integer NOT NULL DEFAULT 0,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  status public.registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.minister_registrations TO authenticated;
GRANT ALL ON public.minister_registrations TO service_role;
ALTER TABLE public.minister_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view ministers" ON public.minister_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update ministers" ON public.minister_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete ministers" ON public.minister_registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER minister_registrations_touch BEFORE UPDATE ON public.minister_registrations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();