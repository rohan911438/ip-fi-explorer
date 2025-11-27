import { Routes, Route, Navigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import Home from "@/pages/Home";
import Index from "@/pages/Index";
import AssetDetail from "@/pages/AssetDetail";
import Fractionalize from "@/pages/Fractionalize";
import Dashboard from "@/pages/Dashboard";
import Widget from "@/pages/Widget";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  const { isConnected, isConnecting } = useWallet();

  // Show loading screen during initial wallet check
  if (isConnecting && !isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
            <span className="text-primary-foreground font-bold text-sm">IP</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route - Home/Landing page (only when wallet not connected) */}
      <Route 
        path="/" 
        element={
          isConnected ? <Navigate to="/dashboard" replace /> : <Home />
        } 
      />
      
      {/* Protected routes - only accessible when wallet is connected */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/asset/:id" 
        element={
          <ProtectedRoute>
            <AssetDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fractionalize" 
        element={
          <ProtectedRoute>
            <Fractionalize />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/widget" 
        element={
          <ProtectedRoute>
            <Widget />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;