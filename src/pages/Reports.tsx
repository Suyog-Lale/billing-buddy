import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Download } from 'lucide-react';

type GSTRRow = { hsn: string; taxableValue: number; cgst: number; sgst: number; igst: number; total: number };

export default function Reports() {
  const { currentBusiness } = useBusiness();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstr1, setGstr1] = useState<GSTRRow[]>([]);
  const [gstr3b, setGstr3b] = useState({ outward: { taxable: 0, cgst: 0, sgst: 0, igst: 0 }, inward: { taxable: 0, cgst: 0, sgst: 0, igst: 0 } });

  useEffect(() => {
    if (!currentBusiness) return;
    const fetchReports = async () => {
      const bid = currentBusiness.id;

      // GSTR-1: Sales grouped by HSN
      const { data: saleItems } = await supabase
        .from('invoice_items')
        .select('*, invoices!inner(business_id, type, date)')
        .eq('invoices.business_id', bid)
        .eq('invoices.type', 'sale')
        .gte('invoices.date', startDate)
        .lte('invoices.date', endDate);

      const hsnMap: Record<string, GSTRRow> = {};
      (saleItems || []).forEach((item: any) => {
        const hsn = item.hsn_code || 'N/A';
        if (!hsnMap[hsn]) hsnMap[hsn] = { hsn, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        const taxable = Number(item.quantity) * Number(item.price) * (1 - Number(item.discount) / 100);
        hsnMap[hsn].taxableValue += taxable;
        hsnMap[hsn].cgst += Number(item.cgst);
        hsnMap[hsn].sgst += Number(item.sgst);
        hsnMap[hsn].igst += Number(item.igst);
        hsnMap[hsn].total += Number(item.total);
      });
      setGstr1(Object.values(hsnMap));

      // GSTR-3B summary
      const { data: allInvoices } = await supabase.from('invoices').select('*').eq('business_id', bid).gte('date', startDate).lte('date', endDate);
      const inv = allInvoices || [];
      const sales = inv.filter(i => i.type === 'sale');
      const purchases = inv.filter(i => i.type === 'purchase');

      setGstr3b({
        outward: {
          taxable: sales.reduce((s, i) => s + Number(i.subtotal), 0),
          cgst: sales.reduce((s, i) => s + Number(i.cgst_total), 0),
          sgst: sales.reduce((s, i) => s + Number(i.sgst_total), 0),
          igst: sales.reduce((s, i) => s + Number(i.igst_total), 0),
        },
        inward: {
          taxable: purchases.reduce((s, i) => s + Number(i.subtotal), 0),
          cgst: purchases.reduce((s, i) => s + Number(i.cgst_total), 0),
          sgst: purchases.reduce((s, i) => s + Number(i.sgst_total), 0),
          igst: purchases.reduce((s, i) => s + Number(i.igst_total), 0),
        },
      });
    };
    fetchReports();
  }, [currentBusiness, startDate, endDate]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="h-7 w-7" /> GST Reports
      </h1>

      <div className="flex gap-4 flex-wrap">
        <div><Label>From</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div><Label>To</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
      </div>

      <Tabs defaultValue="gstr1">
        <TabsList>
          <TabsTrigger value="gstr1">GSTR-1</TabsTrigger>
          <TabsTrigger value="gstr3b">GSTR-3B</TabsTrigger>
        </TabsList>

        <TabsContent value="gstr1" className="mt-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-heading">GSTR-1 — Outward Supplies (HSN Summary)</CardTitle></CardHeader>
            <CardContent>
              {gstr1.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sales data for selected period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="py-2 px-3">HSN Code</th>
                        <th className="py-2 px-3 text-right">Taxable Value</th>
                        <th className="py-2 px-3 text-right">CGST</th>
                        <th className="py-2 px-3 text-right">SGST</th>
                        <th className="py-2 px-3 text-right">IGST</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1.map(row => (
                        <tr key={row.hsn} className="border-b border-border/50">
                          <td className="py-2 px-3 font-medium">{row.hsn}</td>
                          <td className="py-2 px-3 text-right">{fmt(row.taxableValue)}</td>
                          <td className="py-2 px-3 text-right">{fmt(row.cgst)}</td>
                          <td className="py-2 px-3 text-right">{fmt(row.sgst)}</td>
                          <td className="py-2 px-3 text-right">{fmt(row.igst)}</td>
                          <td className="py-2 px-3 text-right font-semibold">{fmt(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gstr3b" className="mt-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-heading">GSTR-3B — Summary Return</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {[{ title: '3.1 — Outward Supplies', data: gstr3b.outward }, { title: '4 — Eligible ITC (Inward)', data: gstr3b.inward }].map(section => (
                <div key={section.title}>
                  <h3 className="font-heading font-semibold mb-3">{section.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Taxable Value</p>
                      <p className="font-semibold">{fmt(section.data.taxable)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">CGST</p>
                      <p className="font-semibold">{fmt(section.data.cgst)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">SGST</p>
                      <p className="font-semibold">{fmt(section.data.sgst)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">IGST</p>
                      <p className="font-semibold">{fmt(section.data.igst)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-heading font-semibold mb-2">Net Tax Payable</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CGST</p>
                    <p className="font-bold text-lg">{fmt(Math.max(0, gstr3b.outward.cgst - gstr3b.inward.cgst))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SGST</p>
                    <p className="font-bold text-lg">{fmt(Math.max(0, gstr3b.outward.sgst - gstr3b.inward.sgst))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IGST</p>
                    <p className="font-bold text-lg">{fmt(Math.max(0, gstr3b.outward.igst - gstr3b.inward.igst))}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
