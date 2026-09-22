import { Layout } from "@/components/Layout";
import Aurora from "@/components/ui/Aurora";

export default function Policies() {
  return (
    <Layout>
      <section className="relative overflow-hidden pt-32 pb-16 text-center bg-black text-white">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#3B82F6", "#8B5CF6", "#D946EF"]} blend={0.6} amplitude={1.5} speed={0.5} />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.3em] font-semibold">Divine Wheel of Fortune</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 drop-shadow-xl">Our Work & Policies</h1>
          <p className="text-white/80 mt-5 max-w-xl mx-auto text-lg drop-shadow">Commitment to ethics, transparency, and the sacred space.</p>
        </div>
      </section>
      
      <section className="container max-w-4xl py-16 md:py-24 space-y-16">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-6">Our Work</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
            <p>
              At Divine Wheel of Fortune, we approach all spiritual practices, readings, and healings with the utmost reverence and respect. Our purpose is to guide, empower, and illuminate the path for our clients through authentic divinatory arts, energy healing, and carefully sourced sacred objects.
            </p>
            <p>
              We believe in creating a safe, non-judgmental environment where healing can naturally occur. Every reading is performed with honest intention, and every product is energetically cleansed before reaching your hands.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-6">Cancellation & Refund Policy</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
            <p>
              <strong>Session Cancellations:</strong> We require at least 24 hours notice if you need to reschedule or cancel a booked session. Cancellations made within 24 hours of the appointment time are non-refundable.
            </p>
            <p>
              <strong>Product Returns:</strong> Due to the sacred and energetic nature of our products (crystals, malas, rudraksha), we do not accept returns once a product has been shipped, ensuring that each item you receive holds only pure energy. If an item arrives damaged during transit, please contact us within 48 hours of delivery with photographic proof for a replacement.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-6">Privacy Policy</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
            <p>
              Your privacy is paramount. Any information shared during a reading, healing session, or consultation is held in strict confidence. We do not share, sell, or distribute your personal details, birth charts, or session recordings to any third parties under any circumstances.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-6">Ethics & Boundaries</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
            <p>
              While we provide intuitive guidance and spiritual counseling, our services do not replace professional medical, legal, or financial advice. We reserve the right to decline any question or session that violates our ethical boundaries or attempts to infringe upon the free will and privacy of a third party.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
