import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Building2, User } from 'lucide-react';

export default function Settings() {
  const { currentBusiness, businesses } = useBusiness();
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
        <SettingsIcon className="h-7 w-7" /> Settings
      </h1>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-heading flex items-center gap-2"><User className="h-5 w-5" /> Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><span className="text-sm text-muted-foreground">Email:</span> <span className="text-sm font-medium">{user?.email}</span></div>
          <Button variant="destructive" size="sm" onClick={signOut}>Sign Out</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-heading flex items-center gap-2"><Building2 className="h-5 w-5" /> Businesses ({businesses.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {businesses.map(b => (
            <div key={b.id} className={`p-3 rounded-lg border ${b.id === currentBusiness?.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <p className="font-medium">{b.name}</p>
              {b.gstin && <p className="text-xs text-muted-foreground">GSTIN: {b.gstin}</p>}
              {b.state && <p className="text-xs text-muted-foreground">{b.city}, {b.state}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
