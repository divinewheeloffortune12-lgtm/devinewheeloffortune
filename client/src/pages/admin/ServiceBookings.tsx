import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2, Eye, Printer, Download } from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export const ServiceBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  // Service Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/services")
      ]);
      setBookings(bookingsRes.data.data || []);
      setServices(servicesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    let filteredBookings = bookings;
    if (filterDate) {
      const selectedDate = new Date(filterDate).setHours(0,0,0,0);
      filteredBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt).setHours(0,0,0,0);
        return bDate === selectedDate;
      });
    }

    if (filteredBookings.length === 0) {
      toast({ title: "No bookings to export for selected date.", variant: "destructive" });
      return;
    }

    const headers = ["Booking ID", "Date", "Customer Name", "Mobile", "Email", "Service", "Amount", "Payment Status", "Booking Status", "Address", "Notes"];
    const rows = filteredBookings.map(b => [
      b._id,
      new Date(b.createdAt).toLocaleString(),
      `"${b.customerName}"`,
      b.mobile,
      b.email,
      `"${b.service?.name || ''}"`,
      b.amount,
      b.paymentStatus,
      b.status,
      `"${b.address?.replace(/"/g, '""') || ''}"`,
      `"${b.notes?.replace(/"/g, '""') || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_export_${filterDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printBooking = (booking: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking._id}`;
    const dateStr = new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = new Date(booking.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt #${booking._id.slice(-6).toUpperCase()}</title>
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
                    <p>Service Receipt</p>
                </div>
            </div>
            <div class="qr-box">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            </div>
        </div>
        
        <div class="content">
            <div class="info-row">
                <div>
                    <span class="label">Booking No.</span>
                    <div class="value">#${booking._id.slice(-6).toUpperCase()}</div>
                    <div style="font-size:12px; color:#94a3b8; margin-top:6px;">ID: ${booking._id}</div>
                </div>
                <div>
                    <span class="label">Date & Time</span>
                    <div class="value">${dateStr}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 6px;">${timeStr}</div>
                </div>
                <div style="text-align: right;">
                    <span class="label">Status</span>
                    <div class="badge ${booking.paymentStatus === 'PAID' ? 'paid' : 'pending'}">${booking.paymentStatus || 'PENDING'}</div>
                </div>
            </div>
            
            <div class="customer-section">
                <span class="label" style="margin-bottom: 12px;">Billed To</span>
                <div class="customer-name">${booking.customerName || booking.user?.name || 'Unknown User'}</div>
                <div class="customer-value"><strong>Email:</strong> ${booking.email || booking.user?.email || 'Not provided'}</div>
                <div class="customer-value"><strong>Phone:</strong> ${booking.mobile || booking.user?.mobile || 'Not provided'}</div>
                ${booking.address ? `<div class="customer-value" style="margin-top: 12px;"><strong>Address:</strong> ${booking.address}</div>` : ''}
                ${booking.notes ? `<div class="customer-value" style="margin-top: 12px;"><strong>Notes:</strong> ${booking.notes}</div>` : ''}
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
                    <tr>
                        <td style="display: flex; align-items: center; gap: 16px;">
                            ${booking.service?.image ? `<img src="${booking.service.image}" alt="${booking.service?.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />` : `<div style="width: 50px; height: 50px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🔮</div>`}
                            <div>
                                <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${booking.service?.name || 'Unknown Service'}</div>
                                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Duration: ${booking.service?.duration || 'N/A'} mins</div>
                            </div>
                        </td>
                        <td style="text-align: center; color: #475569;">1</td>
                        <td style="text-align: right; color: #475569;">₹${booking.amount}</td>
                        <td style="text-align: right; font-weight: 600; color: #0f172a;">₹${booking.amount}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="totals-container">
                <div class="totals-box">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹${booking.amount?.toLocaleString("en-IN")}</span>
                    </div>
                    <div class="total-row">
                        <span>Platform Fee</span>
                        <span>Free</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Paid</span>
                        <span>₹${booking.amount?.toLocaleString("en-IN")}</span>
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

  const openAddService = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "", duration: "", isActive: true });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const openEditService = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration || "",
      isActive: service.isActive
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("duration", formData.duration);
      fd.append("isActive", formData.isActive.toString());
      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast({ title: "Service updated successfully" });
      } else {
        await api.post("/admin/services", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast({ title: "Service created successfully" });
      }
      
      queryClient.invalidateQueries({ queryKey: ['services-list'] });
      setIsDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving service",
        description: error.response?.data?.message || "Something went wrong"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      queryClient.invalidateQueries({ queryKey: ['services-list'] });
      toast({ title: "Service deleted" });
      setServices(services.filter(s => s._id !== id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting service",
        description: error.response?.data?.message || "Something went wrong"
      });
    }
  };

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">Service Management</h2>
      </div>
      
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="services">Services Master</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Filter Date:</label>
              <Input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40"
              />
              {filterDate && (
                <Button variant="ghost" size="sm" onClick={() => setFilterDate("")} className="text-slate-500">
                  Clear
                </Button>
              )}
            </div>
            <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 bg-white">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings
                    .filter(b => {
                      if (!filterDate) return true;
                      const selectedDate = new Date(filterDate).setHours(0,0,0,0);
                      const bDate = new Date(b.createdAt).setHours(0,0,0,0);
                      return bDate === selectedDate;
                    })
                    .map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{booking._id}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{booking.customerName || booking.user?.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{booking.email || booking.user?.email}</div>
                        <div className="text-xs text-slate-500">{booking.mobile || booking.user?.mobile}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{booking.service?.name || "Unknown Service"}</td>
                      <td className="px-6 py-4 font-medium">₹{booking.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            booking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                            booking.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">No service bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription className="hidden">Detailed view of the booking</DialogDescription>
              </DialogHeader>
              
              {selectedBooking && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Customer Details</p>
                      <p className="font-medium text-slate-800">{selectedBooking.customerName || "Unknown User"}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="font-medium text-slate-500">Email:</span> {selectedBooking.email || selectedBooking.user?.email || "Not provided"}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="font-medium text-slate-500">Mobile:</span> {selectedBooking.mobile || selectedBooking.user?.mobile || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Booking Information</p>
                      <div className="space-y-1 mt-1">
                        <p className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="font-medium text-slate-500 min-w-[80px]">Booking ID:</span> 
                          <span className="break-all">{selectedBooking._id}</span>
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="font-medium text-slate-500 min-w-[80px]">Date:</span> 
                          {new Date(selectedBooking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="font-medium text-slate-500 min-w-[80px]">Time:</span> 
                          {new Date(selectedBooking.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                        <p className="text-sm text-slate-600 flex items-start gap-2 pt-1 border-t border-slate-200/60 mt-1">
                          <span className="font-medium text-slate-500 min-w-[80px]">Service:</span> 
                          <span className="font-medium text-primary">{selectedBooking.service?.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-sm">
                    <p className="text-slate-500 font-medium">Address / Location</p>
                    <p className="mt-1">{selectedBooking.address}</p>
                  </div>

                  {selectedBooking.notes && (
                    <div className="border-t border-slate-100 pt-4 text-sm">
                      <p className="text-slate-500 font-medium">Notes / Purpose</p>
                      <p className="mt-1 italic text-slate-700">{selectedBooking.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                    <div>
                      <p className="text-slate-500 font-medium">Amount</p>
                      <p className="mt-1 font-medium text-lg text-slate-900">₹{selectedBooking.amount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Payment</p>
                      <p className={`mt-1 font-semibold ${selectedBooking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {selectedBooking.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Status</p>
                      <p className="mt-1 font-semibold text-blue-600">{selectedBooking.status}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => printBooking(selectedBooking)} className="flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Print Details
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="services">
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddService}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                  <DialogDescription className="hidden">
                    Service details form
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleServiceSubmit} className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Service Name</label>
                    <Input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Tarot Reading (30 mins)" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      rows={3} 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input 
                        type="number" 
                        required 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <Input 
                        value={formData.duration} 
                        onChange={e => setFormData({...formData, duration: e.target.value})} 
                        placeholder="e.g. 1 hour" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Service Image</label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setImageFile(e.target.files?.[0] || null)} 
                    />
                    {editingService?.image && !imageFile && (
                      <img src={editingService.image} alt="Current" className="w-20 h-20 object-cover mt-2 rounded" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      className="w-4 h-4"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Service is Available</label>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Service"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col ${!service.isActive ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">No img</div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => openEditService(service)} className="p-2 bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteService(service._id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <p className="text-xs font-semibold text-primary mb-2">₹{service.price} • {service.duration || 'N/A'}</p>
                <p className="text-sm text-slate-500 flex-1 line-clamp-3 mb-4">{service.description}</p>
                <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded w-max">
                  {service.isActive ? "Available" : "Unavailable"}
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500">
                No services created yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
