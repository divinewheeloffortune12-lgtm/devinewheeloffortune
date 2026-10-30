import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowLeft, Share2, Check, ShieldCheck, Clock3, CalendarCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { optimizeImage, DEFAULT_FALLBACK_IMAGE } from "@/lib/utils";
import { loadRazorpayScript } from "./Services";

type Service = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  duration?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", address: "", notes: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    let live = true;
    setIsLoading(true);

    api
      .get(`/bookings/services/${encodeURIComponent(slug || "")}`)
      .then((res) => {
        if (live && res.data.success && res.data.data) {
          setService(res.data.data);
        } else if (live) {
          setService(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch service:", err);
        if (live) setService(null);
      })
      .finally(() => {
        if (live) setIsLoading(false);
      });

    return () => {
      live = false;
    };
  }, [slug]);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (isLoggedIn && isModalOpen) {
      api
        .get("/profile")
        .then(({ data }) => {
          if (data?.data) {
            const u = data.data;
            setFormData((prev) => ({
              ...prev,
              name: prev.name || u.name || "",
              email: prev.email || u.email || "",
              mobile: prev.mobile || u.mobile || "",
              address: prev.address || u.address?.addressLine1 || "",
            }));
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, isModalOpen]);

  const handleShare = async () => {
    if (!service) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: `${service.name} | Divine Wheel of Fortune`,
      text: service.description
        ? `${service.name} - ${service.description.slice(0, 100)}... Book online with Nattasha Sharrma.`
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
      setCopied(true);
      toast.success("Service link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleBookClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login or signup to book a service");
      navigate("/login", {
        state: { from: `/service/${service?.slug || service?._id}`, preselectService: service?.name },
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      const verifyRes = await api.post("/bookings/verify-payment", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyRes.data.success) {
        toast.success("Booking confirmed successfully!");
        setIsModalOpen(false);
        setFormData({ name: "", mobile: "", email: "", address: "", notes: "" });
        navigate("/profile");
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
    if (!service) return;

    setIsProcessing(true);

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      const orderResponse = await api.post("/bookings/create-order", {
        customerName: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        notes: formData.notes,
        address: formData.address,
        serviceId: service._id,
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
        description: `Booking for ${service.name}`,
        order_id: razorpayOrderId,
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: formData.name,
          contact: formData.mobile,
          email: formData.email,
        },
        theme: {
          color: "#9333ea",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error("Payment cancelled.");
          },
        },
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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[70vh] grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container py-36 text-center max-w-lg mx-auto">
          <h1 className="font-serif text-4xl mb-4">Service Unavailable</h1>
          <p className="text-muted-foreground mb-8">
            The service you are looking for may have been updated or moved.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link to="/services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Services
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container-full pt-28 pb-20 md:pb-28">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/services"
            className="inline-flex items-center text-xs uppercase tracking-[.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-full gap-2 border-slate-200 text-slate-700 hover:text-primary hover:border-primary/40"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Link Copied" : "Share Service"}</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Service Image / Visual Showcase */}
          <section className="lg:col-span-6">
            <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 border border-slate-200/80 shadow-md flex items-center justify-center">
              {service.image ? (
                <img
                  src={optimizeImage(service.image, { width: 900 })}
                  alt={service.name}
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/40">
                  <Sparkles className="w-24 h-24 mb-4" />
                  <p className="font-serif text-lg text-slate-500">Divine Energy Session</p>
                </div>
              )}
            </div>
          </section>

          {/* Service Details & Booking Card */}
          <section className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-primary border border-purple-200 text-xs font-medium tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sacred Offering</span>
              </div>

              <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">
                {service.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-slate-700 mb-6">
                <span className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  ₹{service.price.toLocaleString("en-IN")}
                </span>
                {service.duration && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    <Clock3 className="w-3.5 h-3.5" />
                    {service.duration}
                  </span>
                )}
              </div>

              {service.description && (
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-base mb-8 whitespace-pre-line">
                  {service.description}
                </div>
              )}

              {/* Guarantees & Features */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <CalendarCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Personalized Guidance</h4>
                    <p className="text-xs text-slate-500 mt-1">Conducted by Nattasha Sharrma with complete privacy.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Verified & Safe</h4>
                    <p className="text-xs text-slate-500 mt-1">Direct online booking with instant confirmation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Now & Actions */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleBookClick}
                  size="lg"
                  className="w-full sm:flex-1 rounded-full py-6 text-sm font-semibold tracking-wide uppercase shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Book Session Now — ₹{service.price.toLocaleString("en-IN")}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="rounded-full py-6 px-6 gap-2 border-slate-300"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Policy: All sessions and services are final and strictly non-refundable once booked.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Booking Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Book {service.name}</DialogTitle>
            <DialogDescription>
              Provide your details below to schedule your sacred session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="detail-name">Full Name *</Label>
              <Input
                id="detail-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                disabled={isProcessing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-mobile">Mobile Number (WhatsApp) *</Label>
              <Input
                id="detail-mobile"
                required
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="10-digit mobile number"
                disabled={isProcessing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-email">Email Address *</Label>
              <Input
                id="detail-email"
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                disabled={isProcessing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-address">Address / Location *</Label>
              <Input
                id="detail-address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State, Country"
                disabled={isProcessing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-notes">Notes / Specific Queries (Optional)</Label>
              <Input
                id="detail-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What topics or questions would you like to focus on?"
                disabled={isProcessing}
              />
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
              <strong>Notice:</strong> All service bookings are final and strictly non-refundable. Appointment slots cannot be cancelled for a refund once booked.
            </div>

            <Button type="submit" className="w-full mt-2 py-6 rounded-xl" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Proceed to Payment (₹{service.price})
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
