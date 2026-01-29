import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Packages from "./pages/Packages";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";
import Articles from "./pages/Articles";
import ServicePolicy from "./pages/ServicePolicy";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

// Debug component to track routing
const RouteDebugger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log("🔍 [ROUTE DEBUG] Current location:", {
      pathname: location.pathname,
      hash: location.hash,
      search: location.search,
      fullURL: window.location.href,
      hashFromWindow: window.location.hash
    });
  }, [location]);
  
  useEffect(() => {
    console.log("🚀 [ROUTE DEBUG] App mounted. Initial state:", {
      fullURL: window.location.href,
      pathname: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search
    });
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <RouteDebugger />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/service-policy" element={<ServicePolicy />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/privacy" element={<Policies />} />
              <Route path="/terms" element={<Policies />} />
              <Route path="/refund" element={<Policies />} />
              <Route path="/shipping" element={<Policies />} />
              <Route path="/address" element={<Policies />} />
              <Route path="/about-us" element={<Policies />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/doctor" element={<NotFound />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/store" element={<Store />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingCTA />
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
