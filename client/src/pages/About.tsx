import { Layout } from "@/components/Layout";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Aurora from "@/components/ui/Aurora";

export default function About() {
  return (
    <Layout>
      <section className="relative overflow-hidden pt-32 pb-16 text-center bg-black text-white">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#d8b4fe", "#B497CF", "#5227FF"]} blend={0.6} amplitude={1.5} speed={0.5} />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.3em] font-semibold">Divine Wheel of Fortune</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 drop-shadow-xl">About Nattasha Sharrma</h1>
          <p className="text-white/80 mt-5 max-w-xl mx-auto text-lg drop-shadow">Healer, guide, and intuitive practitioner.</p>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#f9f9f9]">
        <div className="container-full grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex flex-col relative">
            <div className="relative w-full max-h-[80vh] flex justify-center items-center rounded-3xl shadow-xl shadow-black/5 border border-black/5 bg-black/5 overflow-hidden">
              <video className="max-w-full max-h-[80vh] w-auto h-auto rounded-3xl object-cover hover:scale-105 transition-transform duration-700" autoPlay muted loop playsInline preload="metadata">
                <source src="/about.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="absolute -bottom-8 -right-4 sm:-right-8 px-8 py-6 text-center rounded-[2rem] bg-white/90 backdrop-blur-sm shadow-xl border border-purple-100 z-10 hidden sm:block">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
              <p className="font-serif text-3xl text-slate-800">Nattasha Sharrma</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Intuitive Guide</p>
            </div>
          </div>
          
          <div className="pl-0 lg:pl-8">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3 flex items-center gap-2">
              <span className="h-px w-8 bg-primary"></span>
              Her Story
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-slate-900 leading-[1.1] mb-8">
              A space created for clarity, healing, and connection.
            </h2>
            
            <div className="space-y-6 text-base md:text-lg leading-relaxed text-slate-600">
              <p>
                Nattasha Sharrma is the healer and spiritual guide behind Divine Wheel of Fortune, a space created for anyone seeking clarity, healing, and a deeper connection to their own path. Through astrology, tarot reading, numerology, and energy healing practices like reiki and theta healing, she helps people navigate life's biggest questions, from relationships and career to inner blockages that quietly hold them back.
              </p>
              <p>
                What sets Nattasha's work apart is how personal it feels. Every tarot reading, every healing session, every piece of guidance is shaped around the person in front of her, not a generic script. She draws from a wide range of traditions—palm reading, chakra healing, past life regression, ancestral healing, and moon ritual work—so that whatever you're going through, there's a path suited to you.
              </p>
              <p>
                Divine Wheel of Fortune is also home to a curated collection of healing tools: rudraksha, crystals, malas, and sacred mantra books, chosen to support the same journey of clarity and transformation. Whether you're booking a session or exploring the shop, everything here is rooted in one simple intention: helping you reconnect with yourself and move forward with confidence.
              </p>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-4 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Explore services <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="/#shop" className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 font-semibold px-6 py-4 rounded-full hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Visit the sacred shop
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
