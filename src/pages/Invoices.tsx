import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText } from 'lucide-react';
import type { Invoice } from '@/lib/types';

export default function Invoices() {
  const { currentBusiness } = useBusiness();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all');

  useEffect(() => {
    if (!currentBusiness) return;
    let q = supabase.from('invoices').select('*, parties(name)').eq('business_id', currentBusiness.id).order('date', { ascending: false });
    if (filter !== 'all') q = q.eq('type', filter);
    if (search) q = q.ilike('invoice_number', `%${search}%`);
    q.then(({ data }) => setInvoices((data || []) as any));
  }, [currentBusiness, filter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Invoices</h1>
        <Button asChild><Link to="/invoices/new"><Plus className="h-4 w-4 mr-2" /> New Invoice</Link></Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['all', 'sale', 'purchase'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'ghost'} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
              {f === 'all' ? 'All' : f + 's'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {invoices.length === 0 && <p className="text-center text-muted-foreground py-12">No invoices yet.</p>}
        {invoices.map(inv => (
          <Card key={inv.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${inv.type === 'sale' ? 'stat-gradient-blue' : 'stat-gradient-green'} text-primary-foreground`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{inv.invoice_number}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{inv.type}</span>
                    <span>•</span>
                    <span>{inv.date}</span>
                    <span>•</span>
                    <span>{(inv as any).parties?.name || 'Walk-in'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{Number(inv.total).toLocaleString('en-IN')}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-success/10 text-success' : inv.status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                  {inv.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
