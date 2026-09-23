import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Receipt, TrendingUp, ChevronLeft, ChevronRight, Package, Truck, CheckCircle2, XCircle, Download, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AdminSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchSales(page);
  }, [page, statusFilter, dateRange]);

  const fetchSales = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/admin/sales?page=${pageNum}&limit=10&status=${statusFilter}&dateRange=${dateRange}`);
      setSales(data.data.sales || data.data || []);
      setTotalPages(data.data.pages || data.pagination?.totalPages || 1);
      setTotalOrders(data.data.total || data.pagination?.total || 0);
      
      // We might need a separate call for total revenue, or just use what we have.
      // Assuming backend sends total revenue or we calculate it.
      // For now, let's fetch stats for the revenue if needed.
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching sales",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch total revenue separately for the dashboard card
    api.get("/admin/stats").then(({ data }) => {
      setTotalRevenue(data.data.totals?.revenue || 0);
      setTotalOrders(data.data.totals?.sales || 0);
    }).catch(() => undefined);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.put(`/admin/sales/${orderId}/status`, { status: newStatus });
      toast({ title: "Status updated successfully" });
      setSales(sales.map(s => s._id === orderId ? { ...s, status: newStatus } : s));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.error?.message || "An error occurred"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return <Package className="w-4 h-4 text-slate-500" />;
      case 'CONFIRMED': 
      case 'PROCESSING': return <Package className="w-4 h-4 text-amber-500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'CANCELLED': 
      case 'REFUNDED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading && sales.length === 0) {
        return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="bg-white/60 rounded-3xl border border-slate-100 p-6 space-y-4">
          <div className="h-12 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const printOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order._id}`;
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const productsHtml = order.products?.map((item: any) => `
      <tr>
          <td style="display: flex; align-items: center; gap: 16px;">
              ${item.product?.images?.[0] ? `<img src="${item.product.images[0]}" alt="${item.product?.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />` : `<div style="width: 50px; height: 50px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📦</div>`}
              <div>
                  <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${item.product?.name || 'Unknown Product'}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">ID: ${item.product?._id || 'N/A'}</div>
              </div>
          </td>
          <td style="text-align: center; color: #475569;">${item.quantity}</td>
          <td style="text-align: right; color: #475569;">₹${item.price}</td>
          <td style="text-align: right; font-weight: 600; color: #0f172a;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('') || '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt #${order.orderNumber || order._id.slice(-6).toUpperCase()}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f1f5f9; padding: 40px; color: #334155; line-height: 1.5; }
        .receipt-container { max-width: 800px; margin: 0 auto; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-radius: 12px; overflow: hidden; position: relative; }
        .header { background: #1e1b26; color: #ffffff; padding: 40px; display: flex; justify-content: space-between; align-items: center; }
        .brand { display: flex; align-items: center; gap: 16px; }
        .logo { width: 60px; height: 60px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .brand-text h1 { font-family: 'Cinzel', serif; font-size: 28px; margin: 0; color: #d4af37; letter-spacing: 1px; }
        .brand-text p { margin: 4px 0 0 0; font-size: 14px; color: #a8a2b8; letter-spacing: 2px; text-transform: uppercase; }
        .qr-box { background: white; padding: 8px; border-radius: 8px; }
        .qr-code { width: 80px; height: 80px; display: block; }
        .content { padding: 40px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #e2e8f0; }
        .label { font-size: 12px; color: #64748b; margin-bottom: 8px; display: block; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .value { font-size: 16px; color: #0f172a; font-weight: 600; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .badge.paid { background: #dcfce7; color: #166534; }
        .badge.pending { background: #fef08a; color: #854d0e; }
        .customer-section { margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 8px; }
        .customer-name { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
        .customer-value { font-size: 14px; color: #475569; margin-bottom: 4px; display: flex; gap: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .items-table th { text-align: left; padding: 16px 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
        .items-table td { border-bottom: 1px solid #f1f5f9; padding: 20px 12px; }
        .totals-container { display: flex; justify-content: flex-end; background: #f8fafc; padding: 24px; border-radius: 8px; }
        .totals-box { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; color: #475569; }
        .total-row.final { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 16px; padding-top: 16px; border-top: 2px solid #e2e8f0; }
        .footer { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; border-top: 1px dashed #cbd5e1; }
        @media print { body { background: white; padding: 0; } .receipt-container { box-shadow: none; max-width: 100%; } }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="brand">
                <div class="logo">✨</div>
                <div class="brand-text">
                    <h1>Divine Wheel of Fortune</h1>
                    <p>Official Receipt</p>
                </div>
            </div>
            <div class="qr-box">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            </div>
        </div>
        
        <div class="content">
            <div class="info-row">
                <div>
                    <span class="label">Order No.</span>
                    <div class="value">#${order.orderNumber || order._id.slice(-6).toUpperCase()}</div>
                    <div style="font-size:12px; color:#94a3b8; margin-top:6px;">ID: ${order._id}</div>
                </div>
                <div>
                    <span class="label">Date & Time</span>
                    <div class="value">${dateStr}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 6px;">${timeStr}</div>
                </div>
                <div style="text-align: right;">
                    <span class="label">Status</span>
                    <div class="badge ${order.paymentStatus === 'PAID' ? 'paid' : 'pending'}">${order.paymentStatus || 'PENDING'}</div>
                </div>
            </div>
            
            <div class="customer-section">
                <span class="label" style="margin-bottom: 12px;">Billed To</span>
                <div class="customer-name">${order.user?.name || 'Unknown User'}</div>
                ${order.user?.email ? `<div class="customer-value"><strong>Email:</strong> ${order.user.email}</div>` : ''}
                ${order.user?.mobile ? `<div class="customer-value"><strong>Phone:</strong> ${order.user.mobile}</div>` : ''}
                ${order.shippingAddress ? `<div class="customer-value" style="margin-top: 12px;"><strong>Address:</strong> ${order.shippingAddress}</div>` : ''}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item Details</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
            </table>
            
            <div class="totals-container">
                <div class="totals-box">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹${(order.totalAmount - (order.shippingCharge || 0)).toLocaleString("en-IN")}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping</span>
                        <span>${order.shippingCharge === 0 ? 'Free' : `₹${(order.shippingCharge || 0).toLocaleString("en-IN")}`}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Paid</span>
                        <span>₹${order.totalAmount?.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            Thank you for choosing Divine Wheel of Fortune.<br>
            May the universe bless your journey.
        </div>
    </div>
    <script>
      window.onload = function() { setTimeout(function() { window.print(); }, 500); }
    </script>
</body>
</html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">Sales & Orders</h2>
          <p className="text-slate-500 mt-1 text-sm">View transaction history and manage order fulfillment.</p>
        </div>
        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => {
            window.open(`${import.meta.env.VITE_API_URL}/admin/sales/export?token=${localStorage.getItem('admin_token') || ''}&status=${statusFilter}&dateRange=${dateRange}`, '_blank');
          }}
        >
          <Download className="w-4 h-4" /> Download Sales
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-3xl font-semibold text-slate-800">{totalOrders}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-semibold text-slate-800">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No sales records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[1000px]">
              <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Payment</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s: any) => (
                  <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">#{s.orderNumber || s._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{s.user?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{s.user?.email || ""}</div>
                      {s.user?.mobile && <div className="text-xs text-slate-500">{s.user.mobile}</div>}
                    </td>
                    <td className="p-4 font-medium text-slate-800">₹{s.totalAmount?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(s.status)}
                        <span className="text-xs font-semibold uppercase tracking-wider">{s.status || 'PENDING_PAYMENT'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'CONFIRMED' && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(s._id, 'PROCESSING')} className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50" disabled={isUpdating}>
                            Process
                          </Button>
                        )}
                        {s.status === 'PROCESSING' && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(s._id, 'SHIPPED')} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50" disabled={isUpdating}>
                            Ship
                          </Button>
                        )}
                        {['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(s.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(s._id, 'CANCELLED')} className="h-8 text-red-600 border-red-200 hover:bg-red-50" disabled={isUpdating}>
                            Cancel
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(s)} className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4 mr-1" /> Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-3">
              Order #{selectedOrder?.orderNumber || selectedOrder?._id.slice(-6).toUpperCase()}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedOrder?.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedOrder?.paymentStatus || 'PENDING_PAYMENT'}
              </span>
            </DialogTitle>
            <DialogDescription className="hidden">
              Order Details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Customer Details</p>
                  <p className="font-medium text-slate-800">{selectedOrder.user?.name || "Unknown User"}</p>
                  <div className="mt-2 space-y-1">
                    {selectedOrder.user?.email && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="font-medium text-slate-500">Email:</span> {selectedOrder.user.email}
                      </p>
                    )}
                    {selectedOrder.user?.mobile && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="font-medium text-slate-500">Mobile:</span> {selectedOrder.user.mobile}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Order Information</p>
                  <div className="space-y-1 mt-1">
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="font-medium text-slate-500 min-w-[70px]">Order ID:</span> 
                      <span className="break-all">{selectedOrder._id}</span>
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="font-medium text-slate-500 min-w-[70px]">Date:</span> 
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="font-medium text-slate-500 min-w-[70px]">Time:</span> 
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Shipping Address</p>
                <div className="bg-white border border-slate-100 p-3 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
                  {selectedOrder.shippingAddress || "No address provided."}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Order Notes</p>
                  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden">
                          {item.product?.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Package className="w-5 h-5" /></div>}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.product?.name || "Unknown Product"}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-600">Shipping</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.shippingCharge === 0 ? 'Free' : `₹${(selectedOrder.shippingCharge || 0).toLocaleString("en-IN")}`}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-medium text-slate-600">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Update Order Status</p>
                <div className="flex gap-3">
                  <Select 
                    value={selectedOrder.status || 'PENDING'} 
                    onValueChange={(val) => handleStatusUpdate(selectedOrder._id, val)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedOrder.status || 'PENDING_PAYMENT'}>
                        Current: {selectedOrder.status?.replace('_', ' ') || 'Pending Payment'}
                      </SelectItem>
                      {(() => {
                        const VALID_TRANSITIONS: Record<string, string[]> = {
                          PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
                          CONFIRMED: ['PROCESSING', 'CANCELLED'],
                          PROCESSING: ['SHIPPED', 'CANCELLED'],
                          SHIPPED: ['DELIVERED'],
                          DELIVERED: ['REFUNDED'],
                          CANCELLED: [],
                          REFUNDED: [],
                        };
                        const getStatusLabel = (status: string) => {
                          switch (status) {
                            case 'PENDING_PAYMENT': return 'Pending Payment';
                            case 'CONFIRMED': return 'Confirmed';
                            case 'PROCESSING': return 'Processing';
                            case 'SHIPPED': return 'Shipped / Dispatched';
                            case 'DELIVERED': return 'Successfully Delivered';
                            case 'CANCELLED': return 'Cancelled';
                            case 'REFUNDED': return 'Refunded';
                            default: return status;
                          }
                        };
                        
                        const allowed = VALID_TRANSITIONS[selectedOrder.status] || [];
                        return allowed.map(status => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Updating the status will immediately reflect on the user's profile.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => printOrder(selectedOrder)} className="flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
