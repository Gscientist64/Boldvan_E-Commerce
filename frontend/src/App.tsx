import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SupportPage from "./pages/SupportPage";
import TrackingPage from "./pages/TrackingPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PaymentTestPage from "./pages/PaymentTestPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryManagement from "./pages/admin/DeliveryManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import AdminManagement from "./pages/admin/AdminManagement";
import RolesManagement from "./pages/admin/RolesManagement";


// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  // Handler for viewing product details
  const handleViewProduct = (product: any) => {
    // Navigate to product detail page
    window.location.href = `/product/${product.id}`;
  };

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/verify-otp" element={<OtpVerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ForgotPasswordPage />} />
                  
                  {/* Main Layout Routes */}
                  <Route path="/" element={<AppLayout />}>
                    <Route 
                      index 
                      element={
                        <HomePage 
                          onViewProduct={handleViewProduct} 
                        />
                      } 
                    />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="tracking" element={<TrackingPage />} />
                    <Route path="order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/payment-test" element={<PaymentTestPage />} />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="orders" element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    } />
                    <Route path="wishlist" element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    } />
                    {/* Protected Routes */}
                    <Route path="checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Admin Routes - Protected with Admin Layout */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly> {/* Changed from requireAdmin to adminOnly */}
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="delivery" element={<DeliveryManagement />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="admin-management" element={<AdminManagement />} />
                    <Route path="roles" element={<RolesManagement />} />
                    {/* Catch-all for admin - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Route>            
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;