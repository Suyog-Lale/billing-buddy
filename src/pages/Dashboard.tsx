import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, TrendingUp, Package, Users, Plus, FileText, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { currentBusiness } = useBusiness();
  const [stats, setStats] = useState({ totalSales: 0, totalPurchases: 0, stockValue: 0, partyCount: 0 });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!currentBusiness) return;
    const bid = currentBusiness.id;

    const fetchData = async () => {
      const [salesRes, purchasesRes, itemsRes, partiesRes, recentRes] = await Promise.all([
        supabase.from('invoices').select('total').eq('business_id', bid).eq('type', 'sale'),
        supabase.from('invoices').select('total').eq('business_id', bid).eq('type', 'purchase'),
        supabase.from('items').select('*').eq('business_id', bid),
        supabase.from('parties').select('id').eq('business_id', bid),
        supabase.from('invoices').select('*, parties(name)').eq('business_id', bid).order('created_at', { ascending: false }).limit(5),
      ]);

      const totalSales = (salesRes.data || []).reduce((s, i) => s + Number(i.total), 0);
      const totalPurchases = (purchasesRes.data || []).reduce((s, i) => s + Number(i.total), 0);
      const items = itemsRes.data || [];
      const stockValue = items.reduce((s, i) => s + Number(i.stock_quantity) * Number(i.purchase_price), 0);
      const low = items.filter(i => Number(i.stock_quantity) <= Number(i.low_stock_alert));

      setStats({ totalSales, totalPurchases, stockValue, partyCount: partiesRes.data?.length || 0 });
      setRecentInvoices(recentRes.data || []);
      setLowStockItems(low);

      // Chart data - last 6 months mock
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      setChartData(months.map(m => ({ month: m, sales: Math.round(totalSales / 6 * (0.7 + Math.random() * 0.6)), purchases: Math.round(totalPurchases / 6 * (0.7 + Math.random() * 0.6)) })));
    };
    fetchData();
  }, [currentBusiness]);

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <h2 className="font-heading text-2xl font-bold">Welcome to BillFlow!</h2>
        <p className="text-muted-foreground">Create your first business to get started.</p>
        <Button asChild><Link to="/business/new"><Plus className="h-4 w-4 mr-2" /> Create Business</Link></Button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Sales', value: stats.totalSales, icon: TrendingUp, gradient: 'stat-gradient-blue' },
    { title: 'Total Purchases', value: stats.totalPurchases, icon: IndianRupee, gradient: 'stat-gradient-green' },
    { title: 'Stock Value', value: stats.stockValue, icon: Package, gradient: 'stat-gradient-orange' },
    { title: 'Total Parties', value: stats.partyCount, icon: Users, gradient: 'stat-gradient-purple', isCurrency: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{currentBusiness.name}</p>
        </div>
        <Button asChild><Link to="/invoices/new"><Plus className="h-4 w-4 mr-2" /> New Invoice</Link></Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.title} className={`${card.gradient} border-0 text-primary-foreground`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-2xl md:text-3xl font-heading font-bold">
                {card.isCurrency === false ? card.value : `₹${card.value.toLocaleString('en-IN')}`}
              </p>
              <p className="text-xs opacity-80 mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="font-heading text-lg">Sales vs Purchases</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(215 70% 25%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" fill="hsl(200 80% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/invoices">View All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices.length === 0 && <p className="text-muted-foreground text-sm">No invoices yet.</p>}
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{inv.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">{inv.parties?.name || 'Walk-in'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{Number(inv.total).toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-success/10 text-success' : inv.status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="glass-card border-warning/30">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lowStockItems.slice(0, 8).map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Stock: {item.stock_quantity} {item.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
