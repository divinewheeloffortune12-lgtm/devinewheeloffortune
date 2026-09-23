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
        <div className="container-full">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
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
                  <strong>Nattasha Sharrma</strong> is an internationally certified holistic healer, spiritual master, Reiki Grand Master, Tarot Visionary, intuitive psychic reader, astrologer, numerologist, spiritual teacher, trainer and occult practitioner. Her work brings together ancient wisdom, energy healing, intuitive guidance and spiritual practices to create a deeply personal and multidimensional approach to inner exploration and transformation.
                </p>
                <p>
                  With a diverse background spanning Reiki, Tarot, Akashic Records, Astrology, Numerology, Theta DNA Healing, Past Life Regression, Hypnotherapy, Crystal Healing, Sound Healing, Chakra Balancing, Pendulum Dowsing, Palm Reading, Manifestation, Shadow Work and Cord Cutting, Nattasha works with a wide range of spiritual and energetic modalities.
                </p>
                <p>
                  Her philosophy is simple: every individual has a unique journey, and no single spiritual system has to define that journey. Rather than limiting her work to one modality, Nattasha draws upon different systems according to the individual's needs, questions, experiences and spiritual path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multidimensional Practice Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-full grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-serif text-slate-900 mb-6">A Multidimensional Spiritual Practice</h3>
            <div className="space-y-6 text-lg text-slate-600">
              <p>
                Nattasha's spiritual journey encompasses both healing and divination, as well as inner work, manifestation and spiritual education. Her intuitive practice includes Tarot Reading, Psychic and Intuitive Guidance, Astrology, Numerology, Palmistry, Pendulum Dowsing, Akashic Records and specialised symbolic reading practices.
              </p>
              <p>
                Her healing and energy work includes Reiki, Dragon Reiki, Dragon Healing, Theta Healing, Crystal Healing, Sound Healing, Chakra Balancing, Money Reiki, Soul Healing and Space Healing. She also explores deeper areas of personal and spiritual development through Shadow Work, Inner Child Work, Cord Cutting, Past Life Regression, Hypnotherapy and subconscious exploration.
              </p>
              <p>
                Alongside these practices, Nattasha works with selected occult and esoteric traditions, including Yogini and Yakshini Sadhana, Talismans, Karelian Vidya, Sacred Feminine practices and Moon Rituals.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 flex flex-col justify-center">
            <h3 className="text-3xl font-serif text-slate-900 mb-6">Beyond Healing — A Teacher and Guide</h3>
            <div className="space-y-6 text-lg text-slate-600">
              <p>
                Teaching is an important part of Nattasha's spiritual journey. She believes that spiritual knowledge can be explored through understanding, practice, discipline and experience. Her role as a teacher is to help students develop their own understanding of the modalities they choose to study.
              </p>
              <p>
                She offers training and guidance in areas including Reiki, Tarot, Akashic Records, Pendulum Dowsing, Theta Healing, Crystal Healing, Dragon Reiki, Dragon Healing, Manifestation Practices, Meditation, Yog Nidra, Energy Work and selected spiritual and occult practices.
              </p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center my-8">
                <p className="italic font-medium text-primary text-xl">
                  Understand → Learn → Practise → Experience → Integrate
                </p>
              </div>
              <p>
                For Nattasha, spiritual education is not simply about collecting knowledge. It is about developing awareness, responsibility, intuition and a deeper understanding of one's own journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Her Approach & Philosophy */}
      <section className="py-20 md:py-32 bg-[#181422] text-white">
        <div className="container-full text-center max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-5xl font-serif mb-10">Her Approach</h3>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            At the heart of Nattasha's work is the belief that spirituality is not something that needs to fit into a single box.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left mb-16">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="italic text-white/90">Some journeys begin with a question.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="italic text-white/90">Some begin with a search for clarity.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="italic text-white/90">Some begin with healing.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="italic text-white/90">Some begin with curiosity.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 sm:col-span-2 md:col-span-2">
              <p className="italic text-white/90">And some begin with the desire to understand oneself at a deeper level.</p>
            </div>
          </div>
          
          <p className="text-lg text-white/70 leading-relaxed max-w-3xl mx-auto">
            Whether through Tarot, Reiki, Akashic Records, Astrology, Numerology, energy healing, Cord Cutting, manifestation, shadow work or spiritual education, Nattasha creates a space for people to explore their experiences through a spiritual and intuitive perspective.
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 md:py-32 bg-[#f9f9f9]">
        <div className="container-full text-center max-w-3xl mx-auto">
          <h3 className="text-4xl font-serif text-slate-900 mb-8">A Journey of Awareness</h3>
          <p className="text-xl text-slate-600 mb-6">
            Nattasha Sharrma's work ultimately centres around one fundamental idea: 
          </p>
          <p className="text-2xl md:text-3xl font-serif italic text-primary mb-10">
            "Awareness creates the possibility for transformation."
          </p>
          <p className="text-lg text-slate-600 mb-12">
            Her purpose is to guide individuals towards greater clarity, self-awareness, intuition and spiritual understanding — while also empowering those who wish to learn and develop their own spiritual practice.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-500 mb-12">
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Healing</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Intuition</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Energy</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Divination</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Occult Wisdom</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Manifestation</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">Spiritual Education</span>
            <span className="px-4 py-2 bg-primary text-white rounded-full shadow-sm">Transformation</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/services" className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Explore Services <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 font-semibold px-8 py-4 rounded-full hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Visit the Sacred Shop
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
