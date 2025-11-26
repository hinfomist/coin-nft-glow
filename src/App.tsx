import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import AdminRoute from "@/components/AdminRoute";
import { AuthProvider } from "@/contexts/AuthContext"; // ✅ ADD THIS IMPORT

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentInstructions = lazy(() => import("./pages/PaymentInstructions"));
const PaymentProof = lazy(() => import("./pages/PaymentProof"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Subscription = lazy(() => import("./pages/Subscription"));
const AdminPendingOrders = lazy(() => import("./pages/AdminPendingOrders"));
const AdminUser = lazy(() => import("./pages/AdminUser"));
const AdminTrashOrders = lazy(() => import("./pages/AdminTrashOrders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  console.log("🔍 App: rendering");
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ✅ WRAP WITH AuthProvider - ADD THIS */}
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PerformanceMonitor />
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading CryptoFlash..." className="min-h-screen" />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/app" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-instructions" element={<PaymentInstructions />} />
                  <Route path="/payment-proof" element={<PaymentProof />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/pending-orders"
                    element={
                      <AdminRoute>
                        <AdminPendingOrders />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/user/:id"
                    element={
                      <AdminRoute>
                        <AdminUser />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/trash-orders"
                    element={
                      <AdminRoute>
                        <AdminTrashOrders />
                      </AdminRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
        {/* ✅ CLOSE AuthProvider - ADD THIS */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
