import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Receipt, TrendingUp, ChevronLeft, ChevronRight, Package, Truck, CheckCircle2, XCircle, Download } from "lucide-react";
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
    const dateStr = new Date(order.createdAt).toLocaleString();
    
    const productsHtml = order.products?.map((item: any) => `
      <tr>
        <td>${item.product?.name || 'Unknown Product'}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${item.price}</td>
        <td style="text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('') || '';

    const html = `
      <html>
        <head>
          <title>Order Receipt #${order.orderNumber || order._id.slice(-6).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; background: #f8fafc; }
            .receipt-card { background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #e2e8f0; padding-bottom: 30px; margin-bottom: 30px; }
            .brand-name { color: #d4af37; font-size: 28px; font-weight: 700; margin: 0 0 5px 0; font-family: serif; }
            .receipt-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 600; margin: 0; }
            .qr-code { border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px; background: #fff; width: 100px; height: 100px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
            .info-box.full { grid-column: 1 / -1; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; margin-bottom: 4px; display: block; }
            .value { font-size: 15px; color: #0f172a; font-weight: 500; }
            
            .service-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .service-table th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .service-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; }
            
            .totals { display: flex; justify-content: flex-end; margin-top: 20px; }
            .totals-box { width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
            .total-row.final { border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 16px; font-size: 20px; font-weight: 700; color: #0f172a; }
            
            .badges { display: flex; gap: 10px; margin-top: 10px; }
            .badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .badge.paid { background: #dcfce7; color: #166534; }
            .badge.pending { background: #fef08a; color: #854d0e; }
            .badge.status { background: #e0f2fe; color: #075985; }
            
            .footer { margin-top: 40px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div>
                <h1 class="brand-name">Divine Wheel of Fortune</h1>
                <p class="receipt-title">Order Receipt</p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">Order #: ${order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Date: ${dateStr}</p>
              </div>
              <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <span class="label">Customer Details</span>
                <div class="value">${order.user?.name || 'Unknown'}</div>
                <div class="value" style="font-weight: 400; color: #475569;">${order.user?.email || ''}</div>
                ${order.user?.mobile ? `<div class="value" style="font-weight: 400; color: #475569;">${order.user.mobile}</div>` : ''}
              </div>
              <div class="info-box">
                <span class="label">Order Status</span>
                <div class="badges">
                  <span class="badge ${order.paymentStatus === 'PAID' ? 'paid' : 'pending'}">${order.paymentStatus}</span>
                  <span class="badge status">${order.status}</span>
                </div>
              </div>
              <div class="info-box full">
                <span class="label">Shipping Address</span>
                <div class="value">${order.shippingAddress || 'No address provided'}</div>
              </div>
            </div>

            <table class="service-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div class="totals">
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
                  <span>Total Amount</span>
                  <span>₹${order.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              Thank you for choosing Divine Wheel of Fortune.<br/>
              For any queries, please contact our support.
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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-medium text-slate-800">{selectedOrder.user?.name || "Unknown"}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.user?.email}</p>
                  {selectedOrder.user?.mobile && <p className="text-sm text-slate-600">{selectedOrder.user.mobile}</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Order Date</p>
                  <p className="font-medium text-slate-800">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Shipping Address</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedOrder.shippingAddress || "No address provided."}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
