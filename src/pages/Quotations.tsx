import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, FileText, ArrowRight, Loader2 } from 'lucide-react';

type Quotation = {
  id: string;
  quote_number: string;
  date: string;
  total: number;
  status: string;
  party_id: string | null;
  parties?: { name: string } | null;
};

export default function Quotations() {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');
  const [converting, setConverting] = useState<string | null>(null);

  const fetchQuotations = async () => {
    if (!currentBusiness) return;
    let q = supabase.from('quotations').select('*, parties(name)').eq('business_id', currentBusiness.id).order('date', { ascending: false });
    if (search) q = q.ilike('quote_number', `%${search}%`);
    const { data } = await q;
    setQuotations((data || []) as any);
  };

  useEffect(() => { fetchQuotations(); }, [currentBusiness, search]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'accepted': return 'bg-success/10 text-success';
      case 'sent': return 'bg-accent/10 text-accent';
      case 'converted': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const convertToInvoice = async (q: Quotation) => {
    if (!currentBusiness) return;
    setConverting(q.id);

    // Fetch quotation items
    const { data: qItems } = await supabase.from('quotation_items').select('*').eq('quotation_id', q.id);

    // Get next invoice number
    const { data: invCount } = await supabase.from('invoices').select('id').eq('business_id', currentBusiness.id);
    const num = (invCount || []).length + 1;

    // Fetch full quotation
    const { data: fullQ } = await supabase.from('quotations').select('*').eq('id', q.id).single();
    if (!fullQ) { setConverting(null); return; }

    // Create invoice
    const { data: inv, error } = await supabase.from('invoices').insert({
      business_id: currentBusiness.id,
      party_id: fullQ.party_id,
      invoice_number: `INV-${String(num).padStart(4, '0')}`,
      type: 'sale',
      date: new Date().toISOString().split('T')[0],
      is_interstate: fullQ.is_interstate,
      subtotal: fullQ.subtotal,
      cgst_total: fullQ.cgst_total,
      sgst_total: fullQ.sgst_total,
      igst_total: fullQ.igst_total,
      discount_total: fullQ.discount_total,
      total: fullQ.total,
      amount_paid: 0,
      status: 'unpaid',
    }).select('id').single();

    if (error || !inv) {
      toast({ title: 'Error', description: error?.message || 'Failed', variant: 'destructive' });
      setConverting(null);
      return;
    }

    // Copy items
    if (qItems && qItems.length > 0) {
      await supabase.from('invoice_items').insert(
        qItems.map((item: any) => ({
          invoice_id: inv.id,
          item_id: item.item_id,
          name: item.name,
          hsn_code: item.hsn_code,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount,
          gst_rate: item.gst_rate,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
          total: item.total,
        }))
      );
    }

    // Update quotation status
    await supabase.from('quotations').update({ status: 'converted' }).eq('id', q.id);

    setConverting(null);
    toast({ title: 'Converted to Invoice!' });
    navigate('/invoices');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Quotations</h1>
        <Button asChild><Link to="/quotations/new"><Plus className="h-4 w-4 mr-2" /> New Quotation</Link></Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search quotations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-3">
        {quotations.length === 0 && <p className="text-center text-muted-foreground py-12">No quotations yet.</p>}
        {quotations.map(q => (
          <Card key={q.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg stat-gradient-purple flex items-center justify-center text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{q.quote_number}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{q.date}</span>
                    <span>•</span>
                    <span>{(q as any).parties?.name || 'Walk-in'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">₹{Number(q.total).toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(q.status)}`}>
                    {q.status}
                  </span>
                </div>
                {q.status !== 'converted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => convertToInvoice(q)}
                    disabled={converting === q.id}
                    className="text-xs"
                  >
                    {converting === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ArrowRight className="h-3 w-3 mr-1" /> Invoice</>}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
