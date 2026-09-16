import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Clock3, Globe2, HeartHandshake, ShieldCheck, Sparkles, Star } from "lucide-react";
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

const services = [
  { title: "Tarot Card Reading", description: "Receive intuitive perspective on the questions and crossroads present in your life.", symbol: "✦" },
  { title: "Cord-Cutting Ritual", description: "A guided energetic ritual created to support release, renewal, and clearer boundaries.", symbol: "∞" },
  { title: "Akashic Records Reading", description: "Explore reflective insights through a contemplative reading of your soul journey.", symbol: "☼" },
  { title: "Reiki & Money Reiki", description: "Gentle energy work focused on balance, receptivity, and your relationship with abundance.", symbol: "◈" },
  { title: "Past Life Regression", description: "A guided inner journey to explore recurring themes, memories, and personal meaning.", symbol: "◌" },
  { title: "Numerology Reading", description: "Discover the symbolism and patterns held within your name and birth date.", symbol: "Ⅸ" },
  { title: "Chakra Balancing", description: "A calming session to support energetic alignment and a renewed sense of equilibrium.", symbol: "❋" },
  { title: "Astrology Consultation", description: "A personal conversation exploring your birth chart, cycles, and current season.", symbol: "☾" },
];

const parallaxServices = services.map((service, index) => ({
  id: index + 1,
  title: service.title,
  description: service.description,
  symbol: service.symbol,
  imageUrl: `/images/${service.title.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_').replace(/-/g, '_')}.png`,
  reverse: index % 2 !== 0
}));

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
      return response.data.data;
    }
  });

  const shopCategories = categoriesData || [];

  return (
    <Layout>
      <ClickSpark sparkColor="#d8b4fe" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
      <section className="relative min-h-[88svh] overflow-hidden bg-black mt-16 lg:mt-16">
        <video className="absolute inset-0 h-full w-full object-cover contrast-125 saturate-110 brightness-110 filter" autoPlay muted loop playsInline preload="metadata" aria-label="Nattasha Sharrma welcoming you to Divine Wheel Of Fortune">
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container-full relative flex min-h-[88svh] items-end pb-8 pt-32 md:pb-12 z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            className="max-w-3xl text-white drop-shadow-2xl"
          >
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/90 drop-shadow-md flex items-center gap-3"
            >
              <span>Intuitive guidance</span>
              <Star className="w-3 h-3 text-primary/70 fill-current" />
              <span>Energy work</span>
              <Star className="w-3 h-3 text-primary/70 fill-current" />
              <span>Sacred living</span>
            </motion.p>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-4xl leading-[0.95] md:text-6xl lg:text-7xl text-white font-serif tracking-tight drop-shadow-xl flex flex-col"
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
              className="mt-7 max-w-xl text-base leading-7 text-white/90 md:text-lg drop-shadow-md"
            >
              A quiet space with Nattasha Sharrma for insight, healing, and deeper connection to your own inner wisdom.
            </motion.p>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="mt-9 grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full sm:w-auto max-w-md sm:max-w-none"
            >
              <Button asChild size="lg" className="h-12 rounded-none bg-background px-2 sm:px-7 text-foreground hover:bg-background/90 shadow-xl text-xs sm:text-base"><a href="#book" className="flex items-center justify-center">Book a session <ArrowRight className="hidden sm:block ml-2 w-4 h-4" /></a></Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-none border-primary-foreground/60 bg-black/20 backdrop-blur-md px-2 sm:px-7 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground shadow-xl text-xs sm:text-base"><a href="#services" className="flex items-center justify-center">Explore services</a></Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <MarqueeSection />

      <section id="about" className="py-20 md:py-32">
        <div className="container-full grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-black/5 border border-black/5 bg-black/5 aspect-[4/5] sm:aspect-square md:aspect-[4/6]">
              <video className="absolute top-0 left-0 w-full h-full object-cover object-[center_top] rounded-3xl" autoPlay muted loop playsInline preload="metadata"><source src="/about.mp4" type="video/mp4" /></video>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-6 px-8 py-6 text-center rounded-[2rem] bg-gradient-to-r from-purple-100/80 to-indigo-50/80 shadow-sm border border-purple-200/50 hover:shadow-md transition-shadow"
            >
              <p className="font-serif text-3xl text-foreground">Nattasha Sharrma</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary font-bold">Intuitive guide & energy practitioner</p>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <SectionHeading eyebrow="Her story" title="Meet yourself at the turning point." />
            <div className="mt-8 grid gap-6 text-base leading-8 text-muted-foreground md:grid-cols-2">
              <p>Nattasha Sharrma is the founder and guiding light behind Divine Wheel of Fortune, a trusted space for spiritual healing and intuitive guidance. With deep expertise across astrology, numerology, tarot and palm reading, and intuitive psychic work, she helps people find clarity in moments of confusion and direction in times of change.</p>
              <p>Her practice goes beyond traditional readings, drawing on reiki healing, chakra balancing, past life regression, and ancestral healing to address the root of what truly holds people back, whether that's emotional blocks, money blocks, or unresolved patterns passed down through generations. Blending ancient wisdom with modern intuitive techniques, Natasha creates a safe, welcoming space where every seeker can heal, awaken, and reconnect with their higher self.</p>
            </div>
            <Button asChild variant="link" className="mt-8 h-auto p-0 text-primary"><Link to="/about">Discover Nattasha Sharrma’s story <ArrowRight /></Link></Button>
          </motion.div>
        </div>
      </section>

      <div id="services" className="pb-20 md:pb-32 flex flex-col">
        <ParallaxScrollFeatureSection 
          title="Ways to work together"
          description="Guidance for every season. Choose a focused 30-minute reading or make room for a deeper 60-minute session."
          sections={parallaxServices.slice(0, 4)}
        />
        <div className="mt-4 md:mt-12 text-center pb-8 flex justify-center w-full">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-14 px-8 text-base transition-transform hover:scale-105">
            <Link to="/services">See More <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </div>

      <section className="relative overflow-hidden py-16 md:py-24 text-white">
        <div className="absolute inset-0 z-0">
          <Aurora
            colorStops={["#d8b4fe", "#B497CF", "#5227FF"]}
            blend={0.5}
            amplitude={1.2}
            speed={0.5}
          />
        </div>
        <div className="relative z-10">
          <CurvedLoop marqueeText="CLARITY ✦ HEALING ✦ ABUNDANCE ✦ ALIGNMENT ✦ " speed={0.8} direction="right" curveAmount={150} />
        </div>
      </section>

      <section id="book" className="py-20 md:py-32">
        <div className="container-narrow text-center">
          <SectionHeading eyebrow="Book a session" title="Choose the space you need." copy="Select a duration to begin. This preview demonstrates the booking experience; no payment will be taken." />
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[30, 60, 90].map((minutes) => <button key={minutes} onClick={() => setDuration(minutes)} className={`min-h-40 border p-6 text-left transition-colors ${duration === minutes ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"}`} aria-pressed={duration === minutes}>
              <Clock3 className="h-5 w-5" /><span className="mt-8 block font-serif text-3xl">{minutes} minutes</span><span className={`mt-2 block text-sm ${duration === minutes ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{minutes === 30 ? "One focused question" : minutes === 60 ? "A deeper personal reading" : "An immersive exploration"}</span>
            </button>)}
          </div>
          <div className="mt-7 flex flex-col items-center justify-between gap-5 border-y border-border py-6 sm:flex-row"><p className="text-left"><span className="block text-sm text-muted-foreground">Your selection</span><strong className="font-serif text-2xl font-medium">{duration}-minute private session</strong></p><Button size="lg" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="h-12 rounded-none px-8">Continue to booking <ArrowRight /></Button></div>
        </div>
      </section>


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
            images={[...shopCategories, ...shopCategories].map((c: Category) => ({ src: c.image, alt: c.name, name: c.name, note: c.note }))} 
            showNavigation 
            showPagination 
            loop 
            autoplay 
            spaceBetween={40} 
          />
        ) : (
          <div className="container-full text-center text-muted-foreground">No categories available.</div>
        )}
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
              {shopCategories.map((item: Category, index: number) => (
                <Link 
                  key={item.name} 
                  to={`/products?category=${item._id}`} 
                  className={`group relative overflow-hidden rounded-3xl block h-[450px] ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''} ${index === 3 ? 'md:col-span-2 lg:col-span-1' : ''} ${index === 4 ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
            {[["Tarot", "How to frame a question for a meaningful reading"], ["Energy", "A gentle ritual for releasing what no longer serves"], ["Sacred living", "Choosing crystals with attention and intuition"]].map(([tag, title], index) => (
              <article key={title} className="bg-white/80 backdrop-blur-md p-10 hover:bg-white transition-colors relative group overflow-hidden">
                {index === 0 && (
                  <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('/images/mala.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                )}
                <div className="relative z-10">
                  <span className="text-7xl font-serif text-primary/10 absolute top-0 right-0 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-500">0{index + 1}</span>
                  <p className="mt-8 text-xs uppercase tracking-editorial text-primary font-semibold">{tag}</p>
                  <h3 className="mt-4 text-2xl leading-snug text-foreground group-hover:text-primary transition-colors">{title}</h3>
                  <button className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read article <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </article>
            ))}
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
          <Button size="lg" className="mt-10 h-14 rounded-full bg-primary px-10 text-primary-foreground hover:bg-primary/90 shadow-xl text-base transition-transform hover:scale-105" onClick={() => window.location.href = "mailto:hello@divinewheeloffortune.com?subject=Session enquiry"}>Contact Nattasha Sharrma <ArrowRight className="ml-2 w-5 h-5" /></Button>
        </div>
      </section>
      
    </Layout>
  );
};

export default Index;
