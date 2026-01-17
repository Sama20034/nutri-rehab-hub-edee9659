import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import SuccessStories from "./pages/SuccessStories";
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
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Profile from "./pages/Profile";
import Store from "./pages/Store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/success-stories" element={<SuccessStories />} />
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
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/store" element={<Store />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
