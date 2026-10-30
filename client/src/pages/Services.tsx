import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Search, Share2, Check } from "lucide-react";
import { motion } from "framer-motion";
import Aurora from "@/components/ui/Aurora";
import { toast } from "sonner";
import api from "@/lib/api";
import { optimizeImage } from "@/lib/utils";

type Service = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  duration?: string;
  description?: string;
  image?: string;
};

// Ensure Razorpay type is defined
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", address: "", notes: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/bookings/services');
        if (response.data.success) {
          setServices(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0 && location.state?.preselectService) {
      const query = location.state.preselectService.toLowerCase();
      const matched = services.find(s => s.name.toLowerCase().includes(query) || query.includes(s.name.toLowerCase()));
      if (matched) {
        // Clear state so it doesn't loop
        window.history.replaceState({}, document.title);
        
        if (!isLoggedIn) {
          toast.error("Please login or signup to book a service");
          navigate('/login', { state: { from: '/services', preselectService: matched.name } });
          return;
        }
        
        setSelectedService(matched);
        setIsModalOpen(true);
      }
    }
  }, [services, location.state, isLoggedIn, navigate]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareService = async (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    const serviceSlug = service.slug || service._id;
    const shareUrl = `${window.location.origin}/service/${encodeURIComponent(serviceSlug)}`;
    const shareData = {
      title: `${service.name} | Divine Wheel of Fortune`,
      text: service.description
        ? `${service.name} - ${service.description.slice(0, 90)}... Book online with Nattasha Sharrma.`
        : `Book ${service.name} online with Divine Wheel of Fortune.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(service._id);
      toast.success(`Link for "${service.name}" copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleBookClick = (service: Service) => {
    if (!isLoggedIn) {
      toast.error("Please login or signup to book a service");
      navigate('/login', { state: { from: `/service/${service.slug || service._id}`, preselectService: service.name } });
      return;
    }
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      const verifyRes = await api.post('/bookings/verify-payment', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
      
      if (verifyRes.data.success) {
        toast.success("Booking confirmed successfully!");
        setIsModalOpen(false);
        setFormData({ name: "", mobile: "", email: "", address: "", notes: "" });
      } else {
        toast.error("Payment verification failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment verification failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    
    setIsProcessing(true);
    
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      // Create backend order
      const orderResponse = await api.post('/bookings/create-order', {
        customerName: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        notes: formData.notes,
        address: formData.address,
        serviceId: selectedService._id
      });

      if (!orderResponse.data.success) {
        toast.error("Failed to initiate booking.");
        setIsProcessing(false);
        return;
      }

      const { razorpayOrderId, amount, key } = orderResponse.data.data;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Divine Wheel Of Fortune",
        description: `Booking for ${selectedService.name}`,
        order_id: razorpayOrderId,
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: formData.name,
          contact: formData.mobile,
        },
        theme: {
          color: "#9333ea",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error("Payment cancelled.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error(error);
      const backendMessage = error.response?.data?.error?.message || "An error occurred while creating the booking.";
      toast.error(backendMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <section className="relative overflow-hidden py-20 md:py-32 bg-black text-white">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#d8b4fe", "#B497CF", "#5227FF"]} blend={0.6} amplitude={1.5} speed={0.5} />
        </div>
        <div className="container-narrow relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif tracking-tight drop-shadow-xl mb-6">Our Sacred Services</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 drop-shadow-md mb-8">
            Explore a comprehensive range of spiritual, intuitive, and energy-based healing modalities guided by Nattasha Sharrma.
          </p>
          <div className="relative max-w-md mx-auto z-20">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/45 rounded-full"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 min-h-[50vh]">
        <div className="container-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center text-muted-foreground">No services available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {services.filter(service => service.name.toLowerCase().includes(searchQuery.toLowerCase())).map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 8) * 0.1 }}
                  className="group flex flex-col bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center overflow-hidden">
                    <Link to={`/service/${service.slug || service._id}`} className="absolute inset-0 z-0">
                      {service.image ? (
                        <img 
                          src={optimizeImage(service.image, { width: 600 })} 
                          alt={service.name} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-primary/30 group-hover:scale-110 group-hover:text-primary/50 transition-transform duration-500" />
                        </div>
                      )}
                    </Link>

                    {/* Share Button top right */}
                    <button
                      type="button"
                      onClick={(e) => handleShareService(service, e)}
                      title="Share this service"
                      className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-primary shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                    >
                      {copiedId === service._id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <Link to={`/service/${service.slug || service._id}`}>
                        <h3 className="font-serif text-xl font-medium leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {service.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-4 font-medium text-primary">
                        ₹{service.price} {service.duration && <span className="text-xs opacity-75 ml-1">({service.duration})</span>}
                      </p>
                      {service.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        className="flex-1 rounded-full group-hover:bg-primary transition-colors" 
                        variant="outline"
                        onClick={() => handleBookClick(service)}
                      >
                        Book Now
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleShareService(service, e)}
                        title="Share service"
                        className="rounded-full w-10 h-10 shrink-0 text-slate-600 hover:text-primary hover:border-primary/40"
                      >
                        {copiedId === service._id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Book Service</DialogTitle>
            <DialogDescription>
              You are booking <strong>{selectedService?.name}</strong>. Provide your details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" disabled={isProcessing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="10-digit number" disabled={isProcessing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" disabled={isProcessing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address / Location</Label>
              <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Your address" disabled={isProcessing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes / Purpose (Optional)</Label>
              <Input id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any specific requirements?" disabled={isProcessing} />
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
              <strong>Notice:</strong> All service bookings are final and strictly non-refundable. Appointment slots cannot be cancelled for a refund once booked.
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Proceed to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Services;
