import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Aurora from "@/components/ui/Aurora";
import { toast } from "sonner";

const allServices = [
  "Astrologer",
  "Astrology + Numerology + Tarot",
  "Astrology + Palm + Tarot",
  "Tarot Reading",
  "Intuitive Psychic Reader",
  "Theta Healer",
  "Past Life Regression",
  "Hypnotherapy",
  "Space Healing",
  "Money Block Healing",
  "Pet Healing",
  "Ancestor Healing",
  "Awakening",
  "7 Chakra Healing Coach",
  "Moon Rituals and Alignment Coach",
  "Yog Nidra and Kriya Guide",
  "Rice Kodi Gomti Chakra and Crystal Reading",
  "Candle Flame Reading",
  "Sand Reading",
  "Flowers Reading",
  "Crayon Reading",
  "Candle Wax Reading",
  "Smoke Reading",
  "Turmeric (Haldi) Reading",
  "Law of Attraction Coach",
  "Reiki Healing",
  "Reiki Psychic Surgery",
  "Angel Therapist",
  "Crystal Healing",
  "Lama Fera",
  "Mediumship (Talk to Ancestors/Loved ones)",
  "Spell Caster",
  "Money Reiki",
  "Cord Cutting"
];

const Services = () => {
  const [selectedService, setSelectedService] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", details: "" });

  const handleBookClick = (service: string) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the data to a backend
    console.log("Booking requested for", selectedService, "with data:", formData);
    toast.success("Booking request sent successfully. We will get back to you soon!");
    setIsModalOpen(false);
    setFormData({ name: "", email: "", phone: "", details: "" });
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

      <section className="py-20 bg-slate-50">
        <div className="container-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {allServices.map((service, index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 8) * 0.1 }}
                className="group flex flex-col bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  {/* We use a placeholder sparkling star if no specific image is available */}
                  <Sparkles className="w-16 h-16 text-primary/30 group-hover:scale-110 group-hover:text-primary/50 transition-transform duration-500 z-0" />
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-medium leading-tight mb-2 group-hover:text-primary transition-colors">{service}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Pricing starting from ₹1,500</p>
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
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Request a Booking</DialogTitle>
            <DialogDescription>
              You are requesting a session for <strong>{selectedService}</strong>. Please fill out your details below and Nattasha will contact you.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">Additional Details (Optional)</Label>
              <Textarea id="details" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Any specific questions or concerns..." />
            </div>
            <Button type="submit" className="w-full mt-2">Send Booking Request</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Services;
