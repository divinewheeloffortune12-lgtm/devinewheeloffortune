import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Clock3, Globe2, HeartHandshake, ShieldCheck, Sparkles, Star, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import CurvedLoop from "@/components/CurvedLoop";
import MarqueeSection from "@/components/MarqueeSection";

import { ParallaxScrollFeatureSection } from "@/components/ui/parallax-scroll-feature-section";
import Carousel_003 from "@/components/ui/Carousel_003";
import Aurora from "@/components/ui/Aurora";
import FoldText from "@/components/ui/FoldText";
import ClickSpark from "@/components/ui/ClickSpark";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { optimizeImage } from "@/lib/utils";

// Removing hardcoded services array; will fetch dynamically.

// Will generate parallaxServices inside the component using fetched data

const faqs = [
  ["Which session length should I choose?", "A 30-minute session suits one focused question, 60 minutes allows deeper exploration, and 90 minutes offers the most spacious experience."],
  ["How are online sessions held?", "After booking, you receive the session details and a private video-call link. You can join from anywhere."],
  ["Do you ship outside India?", "Yes. The sacred shop supports delivery across India and international shipping to selected destinations."],
  ["How should I prepare?", "Find a quiet place, bring your questions or intentions, and arrive with an open mind. No other preparation is required."],
];

const SectionHeading = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => (
  <div className="max-w-2xl">
    <p className="mb-4 text-xs font-semibold uppercase tracking-editorial text-primary">{eyebrow}</p>
    <h2 className="text-4xl leading-tight md:text-6xl">{title}</h2>
    {copy && <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{copy}</p>}
  </div>
);

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
type Category = { _id: string; name: string; image: string; note: string };

const Index = () => {
  const [duration, setDuration] = useState(60);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return (response.data.data || []).filter((c: any) => c && c.name);
    },
    staleTime: 60 * 1000
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services-list'],
    queryFn: async () => {
      const response = await api.get('/bookings/services');
      return response.data.data;
    },
    staleTime: 60 * 1000
  });

  const { data: latestBlogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['latest-blogs'],
    queryFn: async () => {
      const res = await api.get('/blogs?limit=3&showOnHomepage=true');
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const shopCategories = categoriesData || [];
  
  const parallaxServices = (servicesData || []).map((service: any, index: number) => ({
    id: service._id || (index + 1),
    title: service.name,
    description: service.description || "A transformative spiritual session tailored for your healing journey.",
    symbol: ["✦", "∞", "☼", "◈", "◌", "Ⅸ", "❋", "☾"][index % 8],
    imageUrl: service.image || `/images/placeholder.png`,
    reverse: index % 2 !== 0
  }));

  return (
    <Layout>
      <ClickSpark sparkColor="#d8b4fe" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
      <section className="relative min-h-[88svh] overflow-hidden bg-slate-900 mt-16 lg:mt-16">
        {/* Magical Aurora background that shows while video buffers */}
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#3B82F6", "#8B5CF6", "#D946EF"]} speed={0.5} amplitude={1.2} />
        </div>
        
        <video 
          className="absolute inset-0 h-full w-full object-cover contrast-125 saturate-110 brightness-110 filter z-10 transition-opacity duration-1000" 
          autoPlay muted loop playsInline preload="auto"
          aria-label="Nattasha Sharrma welcoming you to Divine Wheel Of Fortune"
          onLoadedData={(e) => {
            (e.target as HTMLVideoElement).style.opacity = '1';
          }}
          style={{ opacity: 0 }}
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-900/10 z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-[-2px] h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
        
        <div className="container-full relative flex min-h-[88svh] items-end justify-start pb-8 pt-32 md:pb-12 z-30">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            className="max-w-2xl text-white drop-shadow-2xl flex flex-col items-start text-left"
          >
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="mb-5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary-foreground/90 drop-shadow-md flex items-center gap-2 sm:gap-3"
            >
              <span>Intuitive guidance</span>
              <Star className="w-2 h-2 sm:w-3 sm:h-3 text-primary/70 fill-current" />
              <span>Energy work</span>
              <Star className="w-2 h-2 sm:w-3 sm:h-3 text-primary/70 fill-current" />
              <span>Sacred living</span>
            </motion.p>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-3xl sm:text-4xl leading-[0.95] md:text-5xl lg:text-6xl text-white font-serif tracking-tight drop-shadow-xl flex flex-col items-start"
            >
              <FoldText 
                text="Divine Wheel" 
                splitBy="char" 
                hinge="top" 
                trigger="mount" 
                duration={0.65} 
                stagger={0.045} 
                color="currentColor" 
                fontSize="inherit" 
                fontWeight="inherit" 
                className="font-bold block"
              />
              <FoldText 
                text="Of Fortune" 
                splitBy="char" 
                hinge="top" 
                trigger="mount" 
                duration={0.65} 
                stagger={0.045} 
                color="currentColor" 
                fontSize="inherit" 
                fontWeight="inherit" 
                className="italic font-normal block"
              />
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="mt-6 max-w-lg text-sm sm:text-base leading-6 sm:leading-7 text-white/90 drop-shadow-md"
            >
              A quiet space with Nattasha Sharrma for insight, healing, and deeper connection to your own inner wisdom.
            </motion.p>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-start"
            >
              <Button asChild size="lg" className="h-12 rounded-none bg-background px-4 sm:px-7 text-foreground hover:bg-background/90 shadow-xl text-xs sm:text-base"><a href="#services" className="flex items-center justify-center">Explore services</a></Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* <MarqueeSection /> */}

      <section id="about" className="py-20 md:py-32">
        <div className="container-full grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex flex-col h-full justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full flex justify-center items-center rounded-[2rem] shadow-[0_0_20px_rgba(168,85,247,0.4)] border-4 border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all overflow-hidden bg-gradient-to-r from-purple-100/80 to-indigo-50/80 group"
            >
              <img 
                src="/about-image.png" 
                alt="Nattasha Sharrma" 
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <SectionHeading eyebrow="Her story" title="Meet yourself at the turning point." />
            <div className="mt-8 flex flex-col gap-6 text-base leading-8 text-muted-foreground md:text-lg md:leading-relaxed text-justify">
              <p>Nattasha Sharrma is the founder and guiding light behind Divine Wheel of Fortune, a trusted space for spiritual healing and intuitive guidance. With deep expertise across astrology, numerology, tarot and palm reading, and intuitive psychic work, she helps people find clarity in moments of confusion and direction in times of change.</p>
              <p>Her practice goes beyond traditional readings, drawing on reiki healing, chakra balancing, past life regression, and ancestral healing to address the root of what truly holds people back, whether that's emotional blocks, money blocks, or unresolved patterns passed down through generations. Blending ancient wisdom with modern intuitive techniques, Natasha creates a safe, welcoming space where every seeker can heal, awaken, and reconnect with their higher self.</p>
            </div>
            <Button asChild variant="link" className="mt-8 h-auto p-0 text-primary"><Link to="/about">Discover Nattasha Sharrma’s story <ArrowRight /></Link></Button>
          </motion.div>
        </div>
      </section>

      <div id="services" className="pb-20 md:pb-32 flex flex-col">
        {servicesLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <ParallaxScrollFeatureSection 
            title="Ways to work together"
            description="Guidance for every season. Choose a focused session or make room for a deeper exploration."
            sections={parallaxServices.slice(0, 4)}
          />
        )}
        <div className="mt-4 md:mt-12 text-center pb-8 flex justify-center w-full">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-14 px-8 text-base transition-transform hover:scale-105">
            <Link to="/services">See More <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </div>



      <section id="shop" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-sky-100/50 via-white to-sky-50/30">
        <div className="container-full relative z-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-14">
             <SectionHeading eyebrow="The sacred shop" title="Objects with intention." copy="Thoughtfully chosen companions for prayer, reflection, ritual, and everyday grounding." />
             <Button asChild variant="outline" className="rounded-none"><a href="#categories">Shop all <ArrowRight /></a></Button>
          </div>
        </div>
        {categoriesLoading ? (
          <div className="container-full flex justify-center py-10">
            <div className="animate-pulse flex space-x-4">
              <div className="h-40 w-40 bg-slate-200 rounded-xl"></div>
              <div className="h-40 w-40 bg-slate-200 rounded-xl"></div>
              <div className="h-40 w-40 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ) : shopCategories.length > 0 ? (
          <Carousel_003 
            images={shopCategories.length >= 3 ? [...shopCategories, ...shopCategories].map((c: Category) => ({ src: optimizeImage(c.image || '', { width: 800 }), alt: c.name, name: c.name, note: c.note, link: `/products?category=${c._id}` })) : shopCategories.map((c: Category) => ({ src: optimizeImage(c.image || '', { width: 800 }), alt: c.name, name: c.name, note: c.note, link: `/products?category=${c._id}` }))} 
            showNavigation 
            showPagination 
            loop={shopCategories.length >= 2} 
            autoplay 
            spaceBetween={40} 
          />
        ) : (
          <div className="container-full text-center text-muted-foreground">No categories available.</div>
        )}
        <div className="mt-8 text-center flex justify-center w-full">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-14 px-8 text-base transition-transform hover:scale-105">
            <a href="#categories">See More Categories <ArrowRight className="ml-2 w-5 h-5" /></a>
          </Button>
        </div>
        <div className="container-full mt-14">
          <div className="flex items-center justify-center gap-3 border-t border-border pt-7 text-sm text-muted-foreground"><Globe2 className="h-5 w-5 text-primary" /> Shipping across India and to selected international destinations</div>
        </div>
      </section>

      <section id="categories" className="py-20 md:py-32 bg-background">
        <div className="container-full">
          <SectionHeading eyebrow="Explore Collections" title="Sacred Offerings" copy="Browse our curated collections to find pieces that resonate with your spirit." />
          {categoriesLoading ? (
            <div className="mt-16 text-center text-muted-foreground">Loading collections...</div>
          ) : (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shopCategories.map((item: Category) => (
                <Link 
                  key={item.name} 
                  to={`/products?category=${item._id}`} 
                  className="group relative overflow-hidden rounded-3xl block h-[320px]"
                >
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent z-10" />
                  <img 
                    src={optimizeImage(item.image || '', { width: 600 })} 
                    alt={item.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover contrast-[1.15] saturate-110 brightness-[1.05] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 p-8 z-20 flex flex-col justify-end">
                    <p className="text-sm uppercase tracking-widest text-primary mb-2 font-medium transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {item.note}
                    </p>
                    <h3 className="text-3xl font-serif text-white transform group-hover:-translate-y-2 transition-transform duration-500">
                      {item.name}
                    </h3>
                    <div className="h-0 overflow-hidden group-hover:h-12 transition-all duration-500 flex items-center mt-2">
                      <span className="inline-flex items-center gap-2 text-sm text-white/90">
                        Explore collection <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-32 bg-slate-50 border-t border-black/5">
        <div className="container-full">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-14">
             <SectionHeading eyebrow="Featured Pieces" title="Latest Additions" copy="Explore the newest arrivals to our sacred shop." />
             <Button asChild variant="outline" className="rounded-none"><Link to="/products">View all pieces <ArrowRight /></Link></Button>
          </div>
          
          <FeaturedProducts />
        </div>
      </section>

      <section id="journal" className="border-y border-border bg-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url('/images/mala.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", filter: "blur(4px)" }} />
        <div className="container-full relative z-10">
          <SectionHeading eyebrow="From the journal" title="Notes for your inner life." />
          <div className="mt-12 grid gap-px bg-black/5 md:grid-cols-3 shadow-lg rounded-2xl overflow-hidden border border-black/5">
            {blogsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white p-10 animate-pulse">
                  <div className="h-4 w-16 bg-slate-200 rounded mb-6 mt-8"></div>
                  <div className="h-6 w-full bg-slate-200 rounded mb-3"></div>
                  <div className="h-6 w-2/3 bg-slate-200 rounded mb-10"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : latestBlogs.length === 0 ? (
              <div className="col-span-3 bg-white p-16 text-center text-slate-500">
                <p>No articles published yet. Check back soon.</p>
              </div>
            ) : (
              latestBlogs.map((blog: any, index: number) => (
                <article key={blog._id} className="bg-white/80 backdrop-blur-md p-10 hover:bg-white transition-colors relative group overflow-hidden flex flex-col justify-between">
                  {index === 0 && blog.image && (
                    <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${optimizeImage(blog.image, { width: 800 })}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                  )}
                  <div className="relative z-10">
                    <span className="text-7xl font-serif text-primary/10 absolute top-0 right-0 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-500">0{index + 1}</span>
                    <p className="mt-8 text-xs uppercase tracking-editorial text-primary font-semibold">{blog.keywords?.[0] || 'Article'}</p>
                    <h3 className="mt-4 text-2xl leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">{blog.title}</h3>
                    <Link to={`/blog/${blog.slug}`} className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read article <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" /></Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-28"><div className="container-narrow"><SectionHeading eyebrow="Good to know" title="Frequently asked questions." />
        <div className="mt-12 border-t border-border">{faqs.map(([question, answer], index) => <div key={question} className="border-b border-border">
          <button className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-xl" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>
            {question}
            <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openFaq === index && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)", height: 0 }}
                animate={{ opacity: 1, filter: "blur(0px)", height: "auto" }}
                exit={{ opacity: 0, filter: "blur(4px)", height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="max-w-2xl pb-7 leading-7 text-muted-foreground">{answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>)}</div>
      </div></section>

      <section id="contact" className="relative py-20 text-foreground md:py-32 border-t border-black/5 overflow-hidden">
        <div className="absolute inset-0 bg-white z-0" />
        {/* Soft purple cloudy gradient effects */}
        <div className="absolute inset-0 z-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(216, 180, 254, 0.4) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(192, 132, 252, 0.35) 0%, transparent 60%), radial-gradient(circle at 50% 0%, rgba(233, 213, 255, 0.5) 0%, transparent 50%)" }} />
        <div className="container-narrow text-center relative z-10">
          <p className="text-xs font-semibold uppercase tracking-editorial text-primary">Begin when you’re ready</p>
          <h2 className="mt-5 text-4xl md:text-6xl text-foreground drop-shadow-sm">Your next chapter can start with one conversation.</h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-foreground/75 drop-shadow-sm">Share your preferred service and session length. Nattasha Sharrma will personally help you with the next step.</p>
          <Button size="lg" className="mt-10 h-14 rounded-full bg-primary px-10 text-primary-foreground hover:bg-primary/90 shadow-xl text-base transition-transform hover:scale-105" onClick={() => window.open("https://wa.me/919876978500", "_blank")}>Contact Nattasha Sharrma <ArrowRight className="ml-2 w-5 h-5" /></Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-50 border-t border-black/5">
        <div className="container-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative mx-auto w-full max-w-lg mb-8 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(168,85,247,0.3)] bg-white transform transition-transform hover:scale-[1.02] duration-500">
              <img src="/momdad.png" alt="Mom and Dad" className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif text-slate-800 mb-4">A Foundation of Love and Support</h3>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto text-lg mb-12">
              Behind every step of this spiritual journey is the unconditional love, guidance, and blessings of my parents. Their unwavering belief has been the cornerstone of Divine Wheel of Fortune.
            </p>
            
            <div className="rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] relative border-4 border-white bg-slate-900 group aspect-[4/5] sm:aspect-video max-w-lg mx-auto">
              <video 
                src="/contactvideo.mp4" 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
    </Layout>
  );
};

export default Index;
