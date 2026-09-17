import { Layout } from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <Layout>
      <section className="py-20 md:py-32 pt-32 bg-[#f9f9f9]">
        <div className="container-full grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex flex-col">
            <div className="relative w-full max-h-[80vh] flex justify-center items-center rounded-3xl shadow-xl shadow-black/5 border border-black/5 bg-black/5">
              <video className="max-w-full max-h-[80vh] w-auto h-auto rounded-3xl object-contain" autoPlay muted loop playsInline preload="metadata">
                <source src="/about.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="mt-6 px-8 py-6 text-center rounded-[2rem] bg-gradient-to-r from-purple-100/80 to-indigo-50/80 shadow-sm border border-purple-200/50">
              <p className="font-serif text-3xl text-foreground">Nattasha Sharrma</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary font-bold">Intuitive guide & energy practitioner</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Her story</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Meet yourself at the turning point.</h2>
            <div className="mt-8 grid gap-6 text-base leading-8 text-muted-foreground">
              <p>
                Nattasha Sharrma is the founder and guiding light behind Divine Wheel of Fortune, a trusted space for spiritual healing and intuitive guidance. With deep expertise across astrology, numerology, tarot and palm reading, and intuitive psychic work, she helps people find clarity in moments of confusion and direction in times of change.
              </p>
              <p>
                Her practice goes beyond traditional readings, drawing on reiki healing, chakra balancing, past life regression, and ancestral healing to address the root of what truly holds people back, whether that's emotional blocks, money blocks, or unresolved patterns passed down through generations. Blending ancient wisdom with modern intuitive techniques, Natasha creates a safe, welcoming space where every seeker can heal, awaken, and reconnect with their higher self.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity">
                Explore services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
