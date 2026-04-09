
-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  cgst_total NUMERIC NOT NULL DEFAULT 0,
  sgst_total NUMERIC NOT NULL DEFAULT 0,
  igst_total NUMERIC NOT NULL DEFAULT 0,
  discount_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  is_interstate BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage quotations via business"
ON public.quotations FOR ALL
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  hsn_code TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'PCS',
  price NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  gst_rate NUMERIC NOT NULL DEFAULT 18,
  cgst NUMERIC NOT NULL DEFAULT 0,
  sgst NUMERIC NOT NULL DEFAULT 0,
  igst NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage quotation_items via quotation"
ON public.quotation_items FOR ALL
USING (quotation_id IN (
  SELECT q.id FROM public.quotations q
  WHERE q.business_id IN (SELECT b.id FROM public.businesses b WHERE b.user_id = auth.uid())
))
WITH CHECK (quotation_id IN (
  SELECT q.id FROM public.quotations q
  WHERE q.business_id IN (SELECT b.id FROM public.businesses b WHERE b.user_id = auth.uid())
));
