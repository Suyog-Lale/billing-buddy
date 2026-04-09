import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Plus } from 'lucide-react';
import type { Item } from '@/lib/types';

const emptyItem = {
  name: '', hsn_code: '', sku: '', barcode: '', unit: 'PCS',
  sale_price: 0, purchase_price: 0, gst_rate: 18, stock_quantity: 0,
  low_stock_alert: 10, batch_number: '', expiry_date: '', category: ''
};

interface Props {
  items: Item[];
  value: string | null;
  onSelect: (item: Item) => void;
  onItemCreated: (item: Item) => void;
}

export default function ItemSearchSelect({ items, value, onSelect, onItemCreated }: Props) {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(i => i.id === value);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.barcode && i.barcode.toLowerCase().includes(search.toLowerCase())) ||
    (i.hsn_code && i.hsn_code.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item: Item) => {
    onSelect(item);
    setSearch('');
    setOpen(false);
  };

  const openAddDialog = () => {
    setForm({ ...emptyItem, name: search });
    setDialogOpen(true);
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error } = await supabase.from('items').insert({
      ...form, business_id: currentBusiness.id,
      expiry_date: form.expiry_date || null,
    }).select('*').single();
    setLoading(false);
    if (error || !data) {
      toast({ title: 'Error', description: error?.message || 'Failed', variant: 'destructive' });
      return;
    }
    toast({ title: 'Item created!' });
    const newItem = data as Item;
    onItemCreated(newItem);
    setDialogOpen(false);
    setSearch('');
  };

  const update = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }));

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <div
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm cursor-pointer items-center gap-1"
          onClick={() => setOpen(!open)}
        >
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
          {open ? (
            <input
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={`truncate ${selectedItem ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedItem ? `${selectedItem.name}${selectedItem.barcode ? ` (${selectedItem.barcode})` : ''}` : 'Select item...'}
            </span>
          )}
        </div>

        {open && (
          <div className="absolute z-50 top-full left-0 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filtered.map(item => (
              <div
                key={item.id}
                className="px-3 py-2 hover:bg-accent/10 cursor-pointer text-sm flex justify-between"
                onClick={() => handleSelect(item)}
              >
                <span>{item.name} {item.barcode ? `(${item.barcode})` : ''}</span>
                <span className="text-muted-foreground text-xs">₹{item.sale_price}</span>
              </div>
            ))}
            {filtered.length === 0 && !search && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No items found</div>
            )}
            {search && (
              <div
                className="px-3 py-2 hover:bg-accent/10 cursor-pointer text-sm font-medium text-primary flex items-center gap-1 border-t border-border"
                onClick={openAddDialog}
              >
                <Plus className="h-3 w-3" /> Add "{search}"
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">Add New Item</DialogTitle></DialogHeader>
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
    </>
  );
}
