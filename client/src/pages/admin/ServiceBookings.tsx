import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[1000px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Mobile</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Address & Notes</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Payment Status</th>
                    <th className="px-6 py-4 font-semibold">Booking Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{booking._id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{booking.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">{booking.mobile}</td>
                      <td className="px-6 py-4 text-slate-600">{booking.email}</td>
                      <td className="px-6 py-4 text-slate-600">{booking.service?.name}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                        <div>{booking.address}</div>
                        {booking.notes && <div className="text-xs text-slate-400 mt-1 italic">Notes: {booking.notes}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium">₹{booking.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          booking.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500">No service bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
