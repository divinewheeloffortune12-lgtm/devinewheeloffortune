import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X, ChevronDown, UserRound, Bell, CalendarClock, Home, Grid, ShoppingBag, Info, Phone, ArrowRight } from "lucide-react";
import { CartIcon } from "@/components/CartIcon";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  const homeHref = (anchor: string) => location.pathname === "/" ? anchor.replace("/", "") : anchor;

  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      if (!token) return { signedIn: false, user: null };
      try {
        const res = await api.get('/auth/me');
        if (res.data?.data) {
          return { signedIn: true, user: res.data.data };
        }
        return { signedIn: false, user: null };
      } catch {
        return { signedIn: false, user: null };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const signedIn = authData?.signedIn ?? false;
  const user = authData?.user ?? null;

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return (res.data?.data || []).filter((c: any) => c && c.name);
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/bookings/services');
      return res.data?.data || [];
    },
    staleTime: 60 * 1000,
  });

  const { data: announcementCount = 0 } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      let readIds: string[] = [];
      try {
        readIds = JSON.parse(localStorage.getItem('read_announcements') || '[]');
      } catch (e) {}
      const unread = (res.data?.data || []).filter((a: any) => !readIds.includes(a._id));
      return Math.min(unread.length, 9);
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Listen for cross-tab storage changes and same-tab custom auth events
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'admin_token' || e.key === null) {
        queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      }
    };
    const onAuthChange = () => queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('auth-change', onAuthChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('auth-change', onAuthChange);
    };
  }, [queryClient]);

  const moreDropdown = [
    { label: "Gallery", href: "/#gallery" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-black/5 bg-white/60 backdrop-blur-xl">
      <nav className="container-full mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors shrink-0">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-serif text-base tracking-wide whitespace-nowrap">
                Divine Wheel <span className="hidden lg:inline font-light text-foreground/80">Of Fortune</span>
              </span>
            </Link>

            {/* Desktop Navigation - Left Aligned */}
            <div className="hidden lg:flex items-center gap-10">
              <Link to="/" className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                <Home className="w-4 h-4 opacity-70" /> Home
              </Link>
              
              {/* Category Mega Menu */}
              <div className="group py-4">
                <a href={homeHref("/#categories")} className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                  <Grid className="w-4 h-4 opacity-70" /> Category <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </a>
                <div className="absolute top-full left-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white shadow-xl border-t border-black/5 z-50">
                  <div className="container-full mx-auto px-4 py-8 grid grid-cols-4 gap-6">
                    {categories.slice(0, 8).map(cat => (
                      <Link key={cat._id} to={`/products?category=${cat.slug}`} className="group/item flex items-center gap-4 hover:bg-slate-50 p-3 rounded-xl transition-colors">
                        <img src={cat.image || 'https://placehold.co/150x150'} alt={cat.name} className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-100" />
                        <div>
                          <p className="font-medium text-sm text-slate-800 group-hover/item:text-primary transition-colors">{cat.name}</p>
                          {cat.note && <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{cat.note}</p>}
                        </div>
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-slate-500 col-span-4 py-4 text-center">No categories found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Mega Menu */}
              <div className="group py-4">
                <Link to="/services" className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                  <CalendarClock className="w-4 h-4 opacity-70" /> Services <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </Link>
                <div className="absolute top-full left-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white shadow-xl border-t border-black/5 z-50">
                  <div className="container-full mx-auto px-4 py-8 grid grid-cols-4 gap-6">
                    {services.slice(0, 8).map(srv => (
                      <Link key={srv._id} to={`/services`} state={{ preselectService: srv.name }} className="group/item flex items-center gap-4 hover:bg-slate-50 p-4 rounded-xl transition-colors border border-transparent hover:border-black/5 shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800 group-hover/item:text-primary transition-colors leading-tight line-clamp-2">{srv.name}</p>
                          <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">₹{srv.price}</p>
                        </div>
                      </Link>
                    ))}
                    {services.length > 0 && (
                      <Link to="/services" className="group/item flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-primary/5 p-4 rounded-xl transition-colors border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md h-full min-h-[80px]">
                        <span className="font-medium text-sm text-primary flex items-center gap-2">
                          View All Services <ArrowRight className="w-4 h-4 transition-transform group-hover/item:translate-x-1" />
                        </span>
                      </Link>
                    )}
                    {services.length === 0 && (
                      <p className="text-sm text-slate-500 col-span-4 py-4 text-center">No services found.</p>
                    )}
                  </div>
                </div>
              </div>

              <Link to="/products" className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                <ShoppingBag className="w-4 h-4 opacity-70" /> Shop
              </Link>
              <Link to="/about" className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                <Info className="w-4 h-4 opacity-70" /> About
              </Link>
              <Link to="/contact" className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary">
                <Phone className="w-4 h-4 opacity-70" /> Contact
              </Link>
              
              {/* More Dropdown */}
              <div className="relative group py-4">
                <button className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-foreground/80 transition-all hover:text-primary whitespace-nowrap">
                  More <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 bg-white shadow-xl rounded-xl border border-black/5 py-2 overflow-hidden z-50">
                  {moreDropdown.map((subItem) => (
                    subItem.href.startsWith('/#') ? (
                      <a 
                        key={subItem.label} 
                        href={homeHref(subItem.href)} 
                        className="block px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-foreground/70 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        {subItem.label}
                      </a>
                    ) : (
                      <Link 
                        key={subItem.label} 
                        to={subItem.href} 
                        className="block px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-foreground/70 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3">
            {/* Actions & Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthLoading ? (
                <div className="hidden lg:flex items-center gap-4 pr-3 border-r border-black/10 mr-1 animate-pulse">
                  <div className="h-4 w-10 bg-slate-200 rounded"></div>
                  <div className="h-8 w-20 bg-slate-200 rounded-full"></div>
                </div>
              ) : !signedIn ? (
                <div className="hidden lg:flex items-center gap-4 pr-3 border-r border-black/10 mr-1">
                  <Link to="/login" className="text-xs font-semibold uppercase tracking-widest text-foreground hover:text-primary transition-all border-b border-transparent hover:border-primary pb-0.5">Login</Link>
                  <Link to="/signup" className="text-xs font-semibold uppercase tracking-widest bg-foreground text-background hover:bg-primary px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Sign Up</Link>
                </div>
              ) : (
                <Link to="/profile" aria-label="My profile" className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors overflow-hidden border border-black/10">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : user?.name ? (
                    <span className="font-bold text-sm uppercase">{user.name.charAt(0)}</span>
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </Link>
              )}
              
              <Link to="/announcements" aria-label="Announcements" className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
                {announcementCount > 0 && <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">{announcementCount}</span>}
              </Link>
              
              <div className="flex items-center cursor-pointer">
                <CartIcon />
              </div>

              <Link to="/services" aria-label="Book a Session" className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors">
                <CalendarClock className="h-5 w-5" />
              </Link>

              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-full text-foreground hover:text-primary hover:bg-primary/10 ml-1" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.div 
                initial={{ x: "100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "100%" }} 
                transition={{ duration: 0.25, ease: "easeOut" }} 
                className="fixed top-0 right-0 h-[100dvh] w-[80%] max-w-sm bg-white backdrop-blur-xl z-50 shadow-2xl border-l border-black/5 lg:hidden flex flex-col"
              >
                <div className="flex flex-col h-full bg-white">
                  <div className="flex items-center justify-between p-5 border-b border-black/5 shrink-0">
                    <span className="font-serif text-foreground tracking-wide text-lg">Menu</span>
                    <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 py-4">
                  
                  <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg"><Home className="w-4 h-4 opacity-70" /> Home</Link>
                  <a href={homeHref("/#categories")} onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg"><Grid className="w-4 h-4 opacity-70" /> Category</a>
                  <Link to="/products" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg"><ShoppingBag className="w-4 h-4 opacity-70" /> Shop</Link>
                  <Link to="/about" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg"><Info className="w-4 h-4 opacity-70" /> About</Link>
                  <Link to="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg"><Phone className="w-4 h-4 opacity-70" /> Contact</Link>

                  <div className="border-t border-black/5 mt-4 pt-6 px-5 flex flex-col gap-4">
                    <Link to="/services" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg">
                      <CalendarClock className="h-5 w-5 opacity-70" />
                      Book a Session
                    </Link>
                    {isAuthLoading ? (
                      <div className="flex flex-col gap-3 px-5 py-4 animate-pulse">
                        <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
                      </div>
                    ) : signedIn ? (
                      <>
                        <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-primary rounded-lg">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
                          ) : user?.name ? (
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">{user.name.charAt(0)}</span>
                          ) : (
                            <UserRound className="h-5 w-5 opacity-70" />
                          )}
                          My Profile
                        </Link>
                        <button onClick={async () => {
                          setOpen(false);
                          try {
                            await api.post('/auth/logout');
                            localStorage.removeItem('token');
                            window.location.href = '/';
                          } catch (err) {
                            localStorage.removeItem('token');
                            window.location.href = '/';
                          }
                        }} className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-left">
                          Log out
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3 px-5 py-4">
                        <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center w-full py-3.5 text-sm font-semibold text-foreground border border-black/10 hover:bg-black/5 rounded-xl transition-colors">Log In</Link>
                        <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center w-full py-3.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm transition-colors">Create Account</Link>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
