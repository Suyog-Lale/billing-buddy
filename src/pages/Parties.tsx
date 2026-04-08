import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Users, Phone, Mail, Loader2 } from 'lucide-react';
import type { Party } from '@/lib/types';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

const emptyParty = { name: '', type: 'customer' as const, gstin: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' };

export default function Parties() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [parties, setParties] = useState<Party[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyParty);
  const [loading, setLoading] = useState(false);

  const fetchParties = async () => {
    if (!currentBusiness) return;
    let q = supabase.from('parties').select('*').eq('business_id', currentBusiness.id).order('name');
    if (filter !== 'all') q = q.eq('type', filter);
    if (search) q = q.ilike('name', `%${search}%`);
    const { data } = await q;
    setParties((data || []) as Party[]);
  };

  useEffect(() => { fetchParties(); }, [currentBusiness, filter, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setLoading(true);
    const { error } = await supabase.from('parties').insert({ ...form, business_id: currentBusiness.id });
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Party added!' });
    setForm(emptyParty);
    setDialogOpen(false);
    fetchParties();
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Parties</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Party</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Add Party</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} required /></div>
                <div>
                  <Label>Type *</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => update('type', e.target.value)}>
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div><Label>GSTIN</Label><Input value={form.gstin} onChange={e => update('gstin', e.target.value)} maxLength={15} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} /></div>
                <div>
                  <Label>State</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => update('pincode', e.target.value)} maxLength={6} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Party
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search parties..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['all', 'customer', 'supplier'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'ghost'} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
              {f === 'all' ? 'All' : f + 's'}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {parties.length === 0 && <p className="text-center text-muted-foreground py-12">No parties found. Add your first customer or supplier.</p>}
        {parties.map(party => (
          <Card key={party.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${party.type === 'customer' ? 'stat-gradient-blue' : 'stat-gradient-green'} text-primary-foreground`}>
                  {party.name[0]}
                </div>
                <div>
                  <p className="font-medium">{party.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full ${party.type === 'customer' ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'}`}>
                      {party.type}
                    </span>
                    {party.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{party.phone}</span>}
                    {party.gstin && <span className="hidden md:inline">GSTIN: {party.gstin}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${Number(party.balance) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{Math.abs(Number(party.balance)).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground">{Number(party.balance) >= 0 ? 'To Receive' : 'To Pay'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
