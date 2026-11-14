CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid');

ALTER TABLE public.registrations
  ADD COLUMN amount_due integer NOT NULL DEFAULT 0 CHECK (amount_due >= 0),
  ADD COLUMN amount_paid integer NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  ADD COLUMN payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN paid_at timestamptz;

COMMENT ON COLUMN public.registrations.amount_due IS 'Fee owed in kobo';
COMMENT ON COLUMN public.registrations.amount_paid IS 'Amount paid in kobo';

-- Course fees (amount in kobo), editable by admins, readable by everyone.
CREATE TABLE public.course_fees (
  course text PRIMARY KEY,
  amount integer NOT NULL DEFAULT 0 CHECK (amount >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_fees TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_fees TO authenticated;
GRANT ALL ON public.course_fees TO service_role;
ALTER TABLE public.course_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view course fees" ON public.course_fees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can add course fees" ON public.course_fees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update course fees" ON public.course_fees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete course fees" ON public.course_fees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER course_fees_touch BEFORE UPDATE ON public.course_fees FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Card payment attempts (amount in kobo). Written only by the server.
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  channel text,
  card_brand text,
  card_last4 text,
  card_bank text,
  gateway_response text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_registration_idx ON public.payments(registration_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER payments_touch BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();