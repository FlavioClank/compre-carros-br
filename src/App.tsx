import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Brands from "./pages/Brands";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

// Garage Pages
import GarageDashboard from "./pages/garage/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES - No auth required */}
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            <Route path="/carros" element={<Cars />} />
            <Route path="/carro/:id" element={<CarDetails />} />
            <Route path="/marcas" element={<Brands />} />
            <Route path="/login" element={<Login />} />

            {/* ADMIN ROUTES - Super Admin only */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* GARAGE ROUTES - Garage only */}
            <Route path="/garage/dashboard" element={
              <ProtectedRoute allowedRoles={["garage"]}>
                <GarageDashboard />
              </ProtectedRoute>
            } />

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
