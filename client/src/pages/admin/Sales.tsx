import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Receipt, TrendingUp, ChevronLeft, ChevronRight, Package, Truck, CheckCircle2, XCircle, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      case 'PENDING': return <Package className="w-4 h-4 text-amber-500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading && sales.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
            <table className="w-full text-left text-sm text-slate-600">
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
                        <span className="text-xs font-semibold uppercase tracking-wider">{s.status || 'PENDING'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'PENDING' && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(s._id, 'SHIPPED')} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50" disabled={isUpdating}>
                            Ship
                          </Button>
                        )}
                        {['PENDING', 'SHIPPED'].includes(s.status) && (
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
                {selectedOrder?.paymentStatus || 'PENDING'}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-medium text-slate-800">{selectedOrder.user?.name || "Unknown"}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.user?.email}</p>
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
                      <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped / Dispatched</SelectItem>
                      <SelectItem value="DELIVERED">Successfully Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
