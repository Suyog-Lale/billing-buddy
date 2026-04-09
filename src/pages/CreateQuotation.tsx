import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, FileText } from 'lucide-react';
import ItemSearchSelect from '@/components/ItemSearchSelect';
import type { Party, Item, InvoiceItem } from '@/lib/types';

export default function CreateQuotation() {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [partyId, setPartyId] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInterstate, setIsInterstate] = useState(false);
  const [lines, setLines] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (!currentBusiness) return;
    const bid = currentBusiness.id;
    Promise.all([
      supabase.from('parties').select('*').eq('business_id', bid),
      supabase.from('items').select('*').eq('business_id', bid),
      supabase.from('quotations').select('id').eq('business_id', bid),
    ]).then(([p, i, q]) => {
      setParties((p.data || []) as Party[]);
      setItems((i.data || []) as Item[]);
      const count = (q.data || []).length + 1;
      setQuoteNumber(`QT-${String(count).padStart(4, '0')}`);
    });
  }, [currentBusiness]);

  const addLine = () => {
    setLines([...lines, { item_id: null, name: '', hsn_code: '', quantity: 1, unit: 'PCS', price: 0, discount: 0, gst_rate: 18, cgst: 0, sgst: 0, igst: 0, total: 0 }]);
  };

  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const calcLine = (line: InvoiceItem): InvoiceItem => {
    const base = line.quantity * line.price;
    const discounted = base - (base * line.discount / 100);
    const gstAmt = discounted * line.gst_rate / 100;
    return {
      ...line,
      cgst: isInterstate ? 0 : gstAmt / 2,
      sgst: isInterstate ? 0 : gstAmt / 2,
      igst: isInterstate ? gstAmt : 0,
      total: discounted + gstAmt,
    };
  };

  const updateLine = (idx: number, key: string, val: string | number) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [key]: val };
      return calcLine(updated);
    }));
  };

  const selectItem = (idx: number, item: Item) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, item_id: item.id, name: item.name, hsn_code: item.hsn_code || '', price: item.sale_price, gst_rate: item.gst_rate, unit: item.unit };
      return calcLine(updated);
    }));
  };

  const handleNewItem = (item: Item) => {
    setItems(prev => [...prev, item]);
  };

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.price * (1 - l.discount / 100), 0);
  const cgstTotal = lines.reduce((s, l) => s + l.cgst, 0);
  const sgstTotal = lines.reduce((s, l) => s + l.sgst, 0);
  const igstTotal = lines.reduce((s, l) => s + l.igst, 0);
  const grandTotal = lines.reduce((s, l) => s + l.total, 0);

  const handleSubmit = async () => {
    if (!currentBusiness || lines.length === 0) {
      toast({ title: 'Error', description: 'Add at least one item', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data: q, error } = await supabase.from('quotations').insert({
      business_id: currentBusiness.id,
      party_id: partyId || null,
      quote_number: quoteNumber,
      date, is_interstate: isInterstate,
      subtotal, cgst_total: cgstTotal, sgst_total: sgstTotal, igst_total: igstTotal,
      discount_total: lines.reduce((s, l) => s + l.quantity * l.price * l.discount / 100, 0),
      total: grandTotal, status: 'draft',
    }).select('id').single();

    if (error || !q) {
      toast({ title: 'Error', description: error?.message || 'Failed', variant: 'destructive' });
      setLoading(false);
      return;
    }

    await supabase.from('quotation_items').insert(lines.map(l => ({
      quotation_id: q.id,
      item_id: l.item_id,
      name: l.name,
      hsn_code: l.hsn_code,
      quantity: l.quantity,
      unit: l.unit,
      price: l.price,
      discount: l.discount,
      gst_rate: l.gst_rate,
      cgst: l.cgst,
      sgst: l.sgst,
      igst: l.igst,
      total: l.total,
    })));

    setLoading(false);
    toast({ title: 'Quotation saved!' });
    navigate('/quotations');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
        <FileText className="h-7 w-7" /> New Quotation
      </h1>

      <Card className="glass-card">
        <CardContent className="p-4 md:p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Quote #</Label>
              <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Customer</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={partyId} onChange={e => setPartyId(e.target.value)}>
                <option value="">Walk-in</option>
                {parties.filter(p => p.type === 'customer').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isInterstate} onChange={e => {
                setIsInterstate(e.target.checked);
                setLines(prev => prev.map(l => calcLine({ ...l })));
              }} className="rounded" />
              Interstate (IGST)
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg">Items</CardTitle>
          <Button size="sm" onClick={addLine}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.length === 0 && <p className="text-center text-muted-foreground py-8">Click "Add Item" to begin</p>}
          {lines.map((line, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Item</Label>
                  <ItemSearchSelect
                    items={items}
                    value={line.item_id}
                    onSelect={(item) => selectItem(idx, item)}
                    onItemCreated={(item) => { handleNewItem(item); selectItem(idx, item); }}
                  />
                </div>
                <div>
                  <Label className="text-xs">HSN</Label>
                  <Input className="h-9 text-sm" value={line.hsn_code || ''} onChange={e => updateLine(idx, 'hsn_code', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input className="h-9 text-sm" type="number" value={line.quantity} onChange={e => updateLine(idx, 'quantity', +e.target.value)} min={1} />
                </div>
                <div>
                  <Label className="text-xs">Price</Label>
                  <Input className="h-9 text-sm" type="number" value={line.price} onChange={e => updateLine(idx, 'price', +e.target.value)} min={0} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">GST%</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" value={line.gst_rate} onChange={e => updateLine(idx, 'gst_rate', +e.target.value)}>
                      {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeLine(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-4 text-xs text-muted-foreground">
                {!isInterstate && <span>CGST: ₹{line.cgst.toFixed(2)}</span>}
                {!isInterstate && <span>SGST: ₹{line.sgst.toFixed(2)}</span>}
                {isInterstate && <span>IGST: ₹{line.igst.toFixed(2)}</span>}
                <span className="font-semibold text-foreground">Total: ₹{line.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {lines.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-64"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              {!isInterstate && <div className="flex justify-between w-64"><span className="text-muted-foreground">CGST</span><span>₹{cgstTotal.toFixed(2)}</span></div>}
              {!isInterstate && <div className="flex justify-between w-64"><span className="text-muted-foreground">SGST</span><span>₹{sgstTotal.toFixed(2)}</span></div>}
              {isInterstate && <div className="flex justify-between w-64"><span className="text-muted-foreground">IGST</span><span>₹{igstTotal.toFixed(2)}</span></div>}
              <div className="flex justify-between w-64 pt-2 border-t border-border font-heading text-lg font-bold">
                <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/quotations')}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Quotation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
