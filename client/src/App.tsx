import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ErrorBoundary } from "./components/ErrorBoundary";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

import { DashboardHome } from "./pages/admin/DashboardHome";
import { AdminUsers } from "./pages/admin/Users";
import { AdminProducts } from "./pages/admin/Products";
import { AdminEditProduct } from "./pages/admin/EditProduct";
import { AdminCategories } from "./pages/admin/Categories";
import { AdminProfile } from "./pages/admin/Profile";
import { AdminAnnouncements } from "./pages/admin/Announcements";
import { AdminSales } from "./pages/admin/Sales";
import { AdminDeleted } from "./pages/admin/Deleted";
import { AdminReports } from "./pages/admin/Reports";
import { ServiceBookings } from "./pages/admin/ServiceBookings";

const Profile = lazy(() => import("./pages/Profile"));
const Contact = lazy(() => import("./pages/Contact"));
const Faq = lazy(() => import("./pages/Faq"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Services = lazy(() => import("./pages/Services"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Policies = lazy(() => import("./pages/Policies"));

const queryClient = new QueryClient();

// Use environment variable for Google Client ID, with a safe fallback
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "137685527535-nuhj8v6mppnip76k0i69chnv6eeibn3g.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
              <Route path="/products" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/services" element={<Services />} />
              <Route path="/policies" element={<Policies />} />
              
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/:id/edit" element={<AdminEditProduct />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="service-bookings" element={<ServiceBookings />} />
                <Route path="deleted" element={<AdminDeleted />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
