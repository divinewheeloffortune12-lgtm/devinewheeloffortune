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
    const dateStr = new Date(booking.createdAt).toLocaleString();
    
    const html = `
      <html>
        <head>
          <title>Booking Receipt #${booking._id}</title>
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
                <p class="receipt-title">Service Booking Receipt</p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">Receipt #: ${booking._id}</p>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Date: ${dateStr}</p>
              </div>
              <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <span class="label">Customer Details</span>
                <div class="value">${booking.customerName}</div>
                <div class="value" style="font-weight: 400; color: #475569;">${booking.email}</div>
                <div class="value" style="font-weight: 400; color: #475569;">${booking.mobile}</div>
              </div>
              <div class="info-box">
                <span class="label">Booking Status</span>
                <div class="badges">
                  <span class="badge ${booking.paymentStatus === 'PAID' ? 'paid' : 'pending'}">${booking.paymentStatus}</span>
                  <span class="badge status">${booking.status}</span>
                </div>
              </div>
              ${booking.address ? `
              <div class="info-box full">
                <span class="label">Address / Location</span>
                <div class="value">${booking.address}</div>
              </div>` : ''}
              ${booking.notes ? `
              <div class="info-box full">
                <span class="label">Notes / Purpose</span>
                <div class="value">${booking.notes}</div>
              </div>` : ''}
            </div>

            <table class="service-table">
              <thead>
                <tr>
                  <th>Service Booked</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.service?.name || 'Unknown Service'}</td>
                  <td style="text-align: right;">₹${booking.amount}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="total-row final">
                  <span>Total Amount</span>
                  <span>₹${booking.amount}</span>
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
                        <div className="font-medium text-slate-900">{booking.customerName}</div>
                        <div className="text-xs text-slate-500">{booking.email}</div>
                        <div className="text-xs text-slate-500">{booking.mobile}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{booking.service?.name}</td>
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 font-medium">Booking ID</p>
                      <p className="font-mono mt-1">{selectedBooking._id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Date</p>
                      <p className="mt-1">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 font-medium">Customer Name</p>
                      <p className="mt-1 font-medium">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Service</p>
                      <p className="mt-1 font-medium">{selectedBooking.service?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Mobile</p>
                      <p className="mt-1">{selectedBooking.mobile}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Email</p>
                      <p className="mt-1">{selectedBooking.email}</p>
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
