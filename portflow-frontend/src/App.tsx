import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Ships from "./pages/Ships";
import Ports from "./pages/Ports";
import ShipTracking from "./pages/ShipTracking";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import MerchantShips from "./pages/MerchantShips";
import MerchantPorts from "./pages/MerchantPorts";
import MerchantAnalytics from "./pages/MerchantAnalytics";
import MerchantMessages from "./pages/MerchantMessages";
import MerchantWeather from "./pages/MerchantWeather";
import MerchantReports from "./pages/MerchantReports";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'admin' | 'merchant' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="/merchant/ships" element={<MerchantShips />} />
            <Route path="/merchant/ports" element={<MerchantPorts />} />
            <Route path="/merchant/analytics" element={<MerchantAnalytics />} />
            <Route path="/merchant/messages" element={<MerchantMessages />} />
            <Route path="/merchant/weather" element={<MerchantWeather />} />
            <Route path="/merchant/reports" element={<MerchantReports />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/ships" element={<Ships />} />
            <Route path="/ports" element={<Ports />} />
            <Route path="/tracking" element={<ShipTracking />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
