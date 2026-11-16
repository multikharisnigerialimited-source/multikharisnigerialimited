ALTER TABLE public.registrations
  ADD COLUMN payment_method text NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'transfer')),
  ADD COLUMN receipt_path text,
  ADD COLUMN receipt_check jsonb;

COMMENT ON COLUMN public.registrations.receipt_check IS 'Automatic check of the uploaded payment receipt screenshot';

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_reference_format CHECK (reference ~ '^[A-Z0-9][A-Z0-9-]{2,39}$');

CREATE POLICY "Admins can read payment receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));