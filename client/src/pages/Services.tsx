import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Aurora from "@/components/ui/Aurora";
import { toast } from "sonner";
import api from "@/lib/api";

type Service = {
  _id: string;
  name: string;
  price: number;
  duration?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleBookClick = (service: Service) => {
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
        setFormData({ name: "", address: "" });
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

    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the booking.");
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
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 drop-shadow-md">
            Explore a comprehensive range of spiritual, intuitive, and energy-based healing modalities guided by Nattasha Sharrma.
          </p>
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
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 8) * 0.1 }}
                  className="group flex flex-col bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Sparkles className="w-16 h-16 text-primary/30 group-hover:scale-110 group-hover:text-primary/50 transition-transform duration-500 z-0" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-medium leading-tight mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ₹{service.price} {service.duration && <span className="text-xs opacity-75 ml-1">({service.duration})</span>}
                      </p>
                    </div>
                    <Button 
                      className="w-full rounded-full mt-auto group-hover:bg-primary transition-colors" 
                      variant="outline"
                      onClick={() => handleBookClick(service)}
                    >
                      Book Now
                    </Button>
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
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" disabled={isProcessing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" disabled={isProcessing} />
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
