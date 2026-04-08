import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Business } from '@/lib/types';

type BusinessContextType = {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (b: Business) => void;
  loading: boolean;
  refetch: () => void;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    if (!user) { setBusinesses([]); setCurrentBusiness(null); setLoading(false); return; }
    const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id);
    const biz = (data || []) as Business[];
    setBusinesses(biz);
    if (biz.length > 0 && !currentBusiness) {
      const saved = localStorage.getItem('currentBusinessId');
      const found = biz.find(b => b.id === saved);
      setCurrentBusiness(found || biz[0]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBusinesses(); }, [user]);

  useEffect(() => {
    if (currentBusiness) localStorage.setItem('currentBusinessId', currentBusiness.id);
  }, [currentBusiness]);

  return (
    <BusinessContext.Provider value={{ businesses, currentBusiness, setCurrentBusiness, loading, refetch: fetchBusinesses }}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
};
