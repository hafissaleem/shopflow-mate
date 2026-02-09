
-- Create store_settings table for WhatsApp numbers and other config
CREATE TABLE public.store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read settings (needed for WhatsApp numbers on frontend)
CREATE POLICY "Authenticated users can read store settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (true);

-- Block anonymous access
CREATE POLICY "Block anonymous access to store settings"
ON public.store_settings
FOR SELECT
TO anon
USING (false);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can insert store settings"
ON public.store_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update store settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete store settings"
ON public.store_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default WhatsApp settings
INSERT INTO public.store_settings (key, value, description) VALUES
  ('whatsapp_admin_number', '', 'Admin WhatsApp number for order submissions (with country code, e.g., +919876543210)'),
  ('whatsapp_customer_care_number', '', 'Customer Care WhatsApp number for inquiries (with country code, e.g., +919876543210)'),
  ('whatsapp_admin_label', 'Send Order via WhatsApp', 'Label for the admin WhatsApp order button'),
  ('whatsapp_customer_care_label', 'Customer Care', 'Label for the customer care WhatsApp button');
