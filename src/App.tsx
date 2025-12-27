import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";

// Public Pages
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Brands from "./pages/Brands";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminGarages from "./pages/admin/Garages";
import AdminCars from "./pages/admin/Cars";
import AdminBrands from "./pages/admin/Brands";
import AdminHistory from "./pages/admin/History";
import AdminLogs from "./pages/admin/Logs";

// Garage Pages
import GarageDashboard from "./pages/garage/Dashboard";
import GarageCars from "./pages/garage/Cars";
import GarageHistory from "./pages/garage/History";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* PUBLIC ROUTES - No auth required */}
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            <Route path="/carros" element={<Cars />} />
            {/* Vehicle detail page by UUID */}
            <Route path="/carro/:id" element={<CarDetails />} />
            <Route path="/marcas" element={<Brands />} />
            <Route path="/login" element={<Login />} />

            {/* ADMIN ROUTES - Super Admin only */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/garages" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminGarages />
              </ProtectedRoute>
            } />
            <Route path="/admin/cars" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminCars />
              </ProtectedRoute>
            } />
            <Route path="/admin/brands" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminBrands />
              </ProtectedRoute>
            } />
            <Route path="/admin/history" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminLogs />
              </ProtectedRoute>
            } />

            {/* GARAGE ROUTES - Garage only */}
            <Route path="/garage/dashboard" element={
              <ProtectedRoute allowedRoles={["garage"]}>
                <GarageDashboard />
              </ProtectedRoute>
            } />
            <Route path="/garage/cars" element={
              <ProtectedRoute allowedRoles={["garage"]}>
                <GarageCars />
              </ProtectedRoute>
            } />
            <Route path="/garage/cars/new" element={
              <ProtectedRoute allowedRoles={["garage"]}>
                <GarageCars />
              </ProtectedRoute>
            } />
            <Route path="/garage/history" element={
              <ProtectedRoute allowedRoles={["garage"]}>
                <GarageHistory />
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
