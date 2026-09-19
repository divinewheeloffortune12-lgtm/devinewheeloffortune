import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, MapPin, User, Lock, Package, CreditCard, Receipt, Download, LogOut, Heart } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Layout } from "@/components/Layout";
import { api, getErrorMessage } from "@/lib/api";

type Order = { _id: string; orderNumber: string; totalAmount: number; status: string; paymentStatus: string; createdAt: string; products: { quantity: number; product: { name: string } | null }[] };

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
});

export const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string; authProvider: string; profileUpdates?: string[]; mobile?: string; address?: Record<string, string>; likedProducts?: any[] } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updateLimitReached, setUpdateLimitReached] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileResponse, ordersResponse] = await Promise.all([api.get("/profile"), api.get("/profile/orders")]);
      const data = profileResponse.data;
      setUserData(data.data);
      setOrders(ordersResponse.data.data);
      
      // Check limits
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentUpdates = (data.data.profileUpdates || []).filter((d: string) => new Date(d) > twentyFourHoursAgo);
      if (recentUpdates.length >= 4) {
        setUpdateLimitReached(true);
      }

      form.reset({
        name: data.data.name || "",
        mobile: data.data.mobile || "",
        addressLine1: data.data.address?.addressLine1 || "",
        addressLine2: data.data.address?.addressLine2 || "",
        landmark: data.data.address?.landmark || "",
        city: data.data.address?.city || "",
        state: data.data.address?.state || "",
        pincode: data.data.address?.pincode || "",
        country: data.data.address?.country || "India",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to view your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (updateLimitReached) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "You have reached the maximum allowed profile updates for the last 24 hours.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.patch("/profile", values);
      
      toast({
        title: "Profile Updated",
        description: "Your information has been successfully saved.",
      });
      
      setUserData(data.data);
      
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentUpdates = (data.data.profileUpdates || []).filter((d: string) => new Date(d) > twentyFourHoursAgo);
      if (recentUpdates.length >= 4) {
        setUpdateLimitReached(true);
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: getErrorMessage(error, "An unexpected error occurred."),
      });
      
      if (getErrorMessage(error, "") === "Profile update limit reached. You can only update your profile 4 times within a 24-hour period. Please try again later.") {
        setUpdateLimitReached(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to request cancellation for this order?")) return;
    try {
      setCancellingOrderId(orderId);
      const { data } = await api.post(`/orders/${orderId}/cancel-request`, { reason: cancelReason });
      if (data.success) {
        toast({ title: "Request Submitted", description: "Your cancellation request has been submitted to admin." });
      }
    } catch (error: any) {
      toast({ 
        title: "Action Failed", 
        description: error.response?.data?.message || "Failed to submit cancellation request.", 
        variant: "destructive" 
      });
    } finally {
      setCancellingOrderId(null);
      setCancelReason("");
    }
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.products.map(p => `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${p.product?.name || 'Item'}</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${p.quantity}</td></tr>`).join('');
    const html = `
      <html>
        <head>
          <title>Invoice #${order.orderNumber}</title>
          <style>body{font-family:sans-serif;padding:40px;color:#333;}</style>
        </head>
        <body>
          <h1 style="color:#d4af37">Divine Wheel Of Fortune</h1>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.paymentStatus}</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background:#f9f9f9;"><th style="text-align:left; padding: 10px;">Item</th><th style="text-align:left; padding: 10px;">Quantity</th></tr>
            ${itemsHtml}
          </table>
          <h2 style="margin-top: 20px; text-align: right;">Total: ₹${order.totalAmount.toLocaleString("en-IN")}</h2>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 px-6 text-center">
          <h2 className="text-2xl font-serif text-slate-900">Please log in to view your profile.</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-5xl mx-auto pt-28 pb-16 px-4 md:px-6">
        <div className="mb-8 rounded-3xl bg-[#181422] text-white p-7 md:p-10 overflow-hidden relative">
          <div className="relative z-10"><p className="text-xs uppercase tracking-[.25em] text-primary">Your sacred space</p><h1 className="text-4xl md:text-5xl font-serif mt-3">Welcome back, {userData.name.split(' ')[0]}.</h1><p className="text-white/65 mt-3">Your details, delivery address, and order journey—all in one private place.</p></div>
          <div className="absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-primary/20 blur-2xl" />
        </div>

        {updateLimitReached && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Update Limit Reached</h4>
              <p className="text-sm opacity-90 mt-1">For security reasons, you can only update your profile 4 times within a 24-hour period. Please try again later.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-[#f7f2e8] rounded-full flex items-center justify-center text-[#d4af37] text-2xl font-serif mb-4">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-medium text-slate-900">{userData.name}</h3>
              <p className="text-slate-500 text-sm truncate">{userData.email}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Account Active
                </div>
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <User className="w-4 h-4" />
                  Provider: <span className="capitalize">{userData.authProvider}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" 
                  onClick={async () => {
                    try {
                      await api.post('/auth/logout');
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    } catch (err) {
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </Button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-400" /> Personal Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                      <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+91 " {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                {/* Address Info */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-400" /> Address Details (Optional)
                  </h3>
                  <div className="space-y-4">
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                      <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="Street address, P.O. box, etc." {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine2" render={({ field }) => (
                      <FormItem><FormLabel>Address Line 2</FormLabel><FormControl><Input placeholder="Apartment, suite, unit, etc." {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="landmark" render={({ field }) => (
                        <FormItem><FormLabel>Landmark</FormLabel><FormControl><Input {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} disabled={updateLimitReached} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting || updateLimitReached} className="w-full md:w-auto bg-[#d4af37] hover:bg-[#b5952f] text-white">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <section className="mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-medium text-slate-900 flex items-center gap-2"><Receipt className="w-5 h-5 text-slate-400" /> Bills & Order History</h2>
          {orders.length === 0 ? <p className="mt-4 text-sm text-slate-500">You have not placed any orders yet.</p> : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-xl border border-slate-100 p-5 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-4">
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">Bill / Order #{order.orderNumber}</p>
                      <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm sm:text-right mt-2 sm:mt-0">
                      <p className="font-semibold text-lg text-slate-900">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">{order.paymentStatus}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div className="flex-1 text-sm text-slate-700">
                      <p className="font-medium mb-1">Items Bought:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {order.products.map((item, idx) => (
                          <li key={idx}>{item.product?.name || "Unknown Product"} × {item.quantity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 min-w-[200px]">
                      <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Tracking Status</p>
                      <p className={`font-semibold mb-3 ${
                        ['CANCELLED', 'REFUNDED'].includes(order.status) ? 'text-red-600' : 
                        order.status === 'DELIVERED' ? 'text-emerald-600' : 
                        order.status === 'SHIPPED' ? 'text-blue-600' :
                        'text-amber-600'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => printInvoice(order)} className="w-full text-xs h-8"><Download className="w-3 h-3 mr-2" /> Download Bill</Button>
                      {!['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleCancelRequest(order._id)} 
                            disabled={cancellingOrderId === order._id}
                            className="w-full text-xs h-8 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700"
                          >
                            {cancellingOrderId === order._id ? "Processing..." : "Cancel Order"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-6 pt-4 border-t border-slate-50 text-xs text-slate-500 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment card details are never stored or displayed for your security.</p>
        </section>

        {/* Liked Products Section */}
        <section className="mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-medium text-slate-900 flex items-center gap-2"><Heart className="w-5 h-5 text-red-400" /> Liked Products</h2>
          {!userData.likedProducts || userData.likedProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">You haven't liked any products yet.</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {userData.likedProducts.map((product) => (
                <div key={product._id} className="border border-slate-100 rounded-xl overflow-hidden group">
                  <div className="aspect-[4/5] bg-slate-50 relative">
                    {product.images && product.images[0] && (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm font-semibold mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-8" onClick={() => window.location.href=`/product/${product.slug}`}>View Product</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default Profile;
