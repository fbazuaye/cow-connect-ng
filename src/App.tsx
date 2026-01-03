import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { RiderProvider } from "@/hooks/useRider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VendorRegister from "./pages/VendorRegister";
import Marketplace from "./pages/Marketplace";
import LivestockDetail from "./pages/LivestockDetail";
import VendorProfile from "./pages/VendorProfile";
import Cart from "./pages/Cart";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderOnboarding from "./pages/rider/RiderOnboarding";
import RiderTrips from "./pages/rider/RiderTrips";
import RiderWallet from "./pages/rider/RiderWallet";
import RiderProfile from "./pages/rider/RiderProfile";
import TripDetail from "./pages/rider/TripDetail";
import TestOrder from "./pages/TestOrder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <RiderProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<BuyerDashboard />} />
                <Route path="/vendor/register" element={<VendorRegister />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/livestock/:id" element={<LivestockDetail />} />
                <Route path="/vendor/:id" element={<VendorProfile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/test-order" element={<TestOrder />} />
                {/* Rider Routes */}
                <Route path="/rider" element={<RiderDashboard />} />
                <Route path="/rider/onboarding" element={<RiderOnboarding />} />
                <Route path="/rider/trips" element={<RiderTrips />} />
                <Route path="/rider/wallet" element={<RiderWallet />} />
                <Route path="/rider/profile" element={<RiderProfile />} />
                <Route path="/rider/trip/:id" element={<TripDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RiderProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
