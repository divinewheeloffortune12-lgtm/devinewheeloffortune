import { Link } from "react-router-dom";
import { Instagram, Sparkles, Mail, Phone, MapPin, Twitter, Facebook, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative bg-white text-foreground overflow-hidden pt-20">
      <div className="container-full relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 pb-16">
          {/* Brand section */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-serif text-2xl font-bold tracking-tight">Divine</span>
            </Link>
            <p className="max-w-[250px] text-sm leading-relaxed text-foreground/70">
              Divine is a modern astrology and energy practitioner platform.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-foreground mb-6">About Us</h3>
            <ul className="space-y-4 text-[13px] text-foreground/70 font-medium">
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-foreground mb-6">Helpful Links</h3>
            <ul className="space-y-4 text-[13px] text-foreground/70 font-medium">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/announcements" className="hover:text-primary transition-colors">Announcements</Link></li>
            </ul>
          </div>

          {/* Contact section */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-foreground mb-6">Contact Us</h3>
            <ul className="space-y-5 text-[13px] text-foreground/80 font-medium">
              <li>
                <a href="mailto:hello@divinewheeloffortune.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 text-primary" /> hello@divine.com
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary" /> +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" /> India, Sessions worldwide
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-foreground/70 z-20 relative">
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Globe className="h-4 w-4" /></a>
          </div>
          <p>© {new Date().getFullYear()} Divine. All rights reserved.</p>
        </div>
      </div>

      {/* Massive background text */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden pointer-events-none flex justify-center items-end z-0 h-3/4 pb-4">
        <h1 
          className="text-[10vw] font-serif leading-[0.75] tracking-tighter font-bold whitespace-nowrap select-none text-transparent" 
          style={{ WebkitTextStroke: '2px rgba(0,0,0,0.08)' }}
        >
          NATTASHA
        </h1>
      </div>
    </footer>
  );
};