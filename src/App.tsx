import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import CreateInvoice from "@/pages/CreateInvoice";
import Parties from "@/pages/Parties";
import Items from "@/pages/Items";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import BusinessForm from "@/pages/BusinessForm";
import Quotations from "@/pages/Quotations";
import CreateQuotation from "@/pages/CreateQuotation";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Auth />;
  return (
    <BusinessProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<CreateInvoice />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/new" element={<CreateQuotation />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/items" element={<Items />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/business/new" element={<BusinessForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BusinessProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
