import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Package, Loader2 } from 'lucide-react';
import type { Item } from '@/lib/types';

const emptyItem = {
  name: '', hsn_code: '', sku: '', barcode: '', unit: 'PCS',
  sale_price: 0, purchase_price: 0, gst_rate: 18, stock_quantity: 0,
  low_stock_alert: 10, batch_number: '', expiry_date: '', category: ''
};

export default function Items() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!currentBusiness) return;
    let q = supabase.from('items').select('*').eq('business_id', currentBusiness.id).order('name');
    if (search) q = q.or(`name.ilike.%${search}%,barcode.ilike.%${search}%,hsn_code.ilike.%${search}%`);
    const { data } = await q;
    setItems((data || []) as Item[]);
  };

  useEffect(() => { fetchItems(); }, [currentBusiness, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setLoading(true);
    const { error } = await supabase.from('items').insert({
      ...form, business_id: currentBusiness.id,
      expiry_date: form.expiry_date || null,
    });
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Item added!' });
    setForm(emptyItem);
    setDialogOpen(false);
    fetchItems();
  };

  const update = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Items & Inventory</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Add Item</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Item Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} required /></div>
                <div><Label>HSN Code</Label><Input value={form.hsn_code} onChange={e => update('hsn_code', e.target.value)} /></div>
                <div><Label>Barcode</Label><Input value={form.barcode} onChange={e => update('barcode', e.target.value)} /></div>
                <div><Label>Sale Price *</Label><Input type="number" value={form.sale_price} onChange={e => update('sale_price', +e.target.value)} min={0} required /></div>
                <div><Label>Purchase Price</Label><Input type="number" value={form.purchase_price} onChange={e => update('purchase_price', +e.target.value)} min={0} /></div>
                <div>
                  <Label>GST Rate %</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gst_rate} onChange={e => update('gst_rate', +e.target.value)}>
                    {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={e => update('unit', e.target.value)} /></div>
                <div><Label>Stock Qty</Label><Input type="number" value={form.stock_quantity} onChange={e => update('stock_quantity', +e.target.value)} min={0} /></div>
                <div><Label>Low Stock Alert</Label><Input type="number" value={form.low_stock_alert} onChange={e => update('low_stock_alert', +e.target.value)} min={0} /></div>
                <div><Label>Batch No.</Label><Input value={form.batch_number} onChange={e => update('batch_number', e.target.value)} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => update('expiry_date', e.target.value)} /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => update('category', e.target.value)} /></div>
                <div><Label>SKU</Label><Input value={form.sku} onChange={e => update('sku', e.target.value)} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, barcode, or HSN..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-3">
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">No items yet. Add your first product.</p>}
        {items.map(item => (
          <Card key={item.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.hsn_code && <span>HSN: {item.hsn_code}</span>}
                      <span>GST: {item.gst_rate}%</span>
                      {item.barcode && <span className="hidden md:inline">Barcode: {item.barcode}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{Number(item.sale_price).toLocaleString('en-IN')}</p>
                  <p className={`text-xs ${Number(item.stock_quantity) <= Number(item.low_stock_alert) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    Stock: {item.stock_quantity} {item.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
