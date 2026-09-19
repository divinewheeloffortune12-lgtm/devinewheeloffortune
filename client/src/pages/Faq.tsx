import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Aurora from "@/components/ui/Aurora";

const faqs = [
  [
    "How do I know which healing or reading service is right for me?",
    "Honestly, most people aren't sure at first, and that's completely okay. I usually suggest starting with a tarot or intuitive psychic reading, since it gives us clarity on what's really going on beneath the surface. From there, we can decide together if something like theta healing, chakra healing, or past life regression would help you move forward."
  ],
  [
    "Can tarot reading actually predict my future?",
    "Tarot isn't about fixed predictions, it's more like a mirror. It reflects the energy and patterns around your situation right now, so we can understand where things are headed and what choices will serve you best going forward."
  ],
  [
    "Do I need to visit in person, or can sessions happen online?",
    "All my sessions, whether it's astrology, tarot, or reiki healing, are available online. You can book a 30 minute, 1 hour, or 90 minute session from wherever you are, and clients from outside India join in regularly too."
  ],
  [
    "What's the difference between astrology, numerology, and tarot reading?",
    "Astrology looks at the position of planets at the time of your birth to understand your life path. Numerology works with the numbers connected to your name and birth date to reveal your strengths and challenges. Tarot, on the other hand, reads the present energy around a specific question or phase of life. Many clients combine all three for a fuller picture, which is why I also offer them together as a combo package."
  ],
  [
    "How long does a healing session take to show results?",
    "It really depends on the person and the depth of the block we're working with. Some clients feel lighter after a single reiki or theta healing session, while deeper issues, like ancestral patterns or money blocks, may need two or three sessions to fully shift. I'll always be honest with you about what I'm sensing rather than promising a fixed timeline."
  ],
  [
    "Is it possible to connect with a loved one who has passed away?",
    "Yes, this is something I work with through channeling and mediumship. Every connection feels different, some come through as strong emotions or memories, others as clear messages, but I always hold the space with care and respect for both you and your loved one."
  ],
  [
    "What should I prepare before a reading or healing session?",
    "Nothing fancy is needed. I'd just suggest finding a quiet space where you won't be interrupted, and coming with an open mind. If there's a specific question or concern on your heart, keep it in mind, it helps the session feel focused and personal rather than general."
  ],
  [
    "Do you ship rudraksha, crystals, and malas outside India?",
    "Yes, international shipping is available for all physical products, including rudraksha, gemstones, crystals, malas, mantra books, and the power coins. Delivery timelines vary by country, and you'll see shipping details at checkout before you complete your order."
  ],
  [
    "How do I choose between a 30 minute, 1 hour, or 90 minute session?",
    "A 30 minute session works well if you have one or two specific questions. A 1 hour session gives us room to explore a situation in more depth, say, relationships, career, or a recurring pattern. The 90 minute session is ideal for deeper healing work like past life regression or when we're addressing several connected concerns in one sitting."
  ],
  [
    "Is spellcasting or money reiki safe, and does it really work?",
    "These practices are rooted in intention, energy, and ritual, and I approach them with the same care and responsibility as any other healing work. They're not a replacement for practical effort in your life, but they can help clear blocks and align your energy so that your own actions flow more easily toward what you're working for."
  ]
];

export default function Faq() {
  return (
    <Layout>
      <section className="relative overflow-hidden pt-32 pb-16 text-center bg-black text-white">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#d8b4fe", "#B497CF", "#5227FF"]} blend={0.6} amplitude={1.5} speed={0.5} />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.3em] font-semibold">Divine Wheel of Fortune</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 drop-shadow-xl">Frequently Asked Questions</h1>
          <p className="text-white/80 mt-5 max-w-xl mx-auto text-lg drop-shadow">Clarity for your journey ahead.</p>
        </div>
      </section>
      
      <section className="container max-w-4xl py-16 md:py-24">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([question, answer], i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-purple-100 py-2">
              <AccordionTrigger className="text-left font-serif text-xl md:text-2xl text-slate-800 hover:text-primary transition-colors">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base md:text-lg leading-8 text-slate-600 mt-2">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </Layout>
  );
}
