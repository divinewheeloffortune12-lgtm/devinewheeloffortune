const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./src/models/Blog');

dotenv.config();

const uri = process.env.MONGODB_URI;

const blogsToSeed = [
  {
    slug: "janam-patri-understanding-your-life-path",
    title: "Janam Patri: Why Your Birth Chart Is the Key to Understanding Your Life's Path",
    excerpt: "Discover what a Janam Patri is, why the planets at your exact time of birth shape your personality and destiny, and why everyone should have their birth chart made.",
    content: `Have you ever wondered why some people seem to move through life with a certain rhythm, career opportunities finding them at the right time, relationships clicking into place, while others feel like they're constantly pushing against something invisible? According to Vedic astrology, the answer is often written in the sky, at the exact moment you took your first breath.

That map is your Janam Patri.

**What Is a Janam Patri?**
A Janam Patri, also known as a birth chart or Kundli, is a detailed astrological record of exactly where every planet, the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu, was positioned in the sky at the precise date, time, and place of your birth. Think of it as a cosmic snapshot, frozen forever, that captures the unique energetic blueprint you were born into.

No two Janam Patris are exactly alike, even twins born minutes apart can carry meaningfully different charts. That's because your birth chart isn't generic, it's yours, calculated specifically from your own birth details.

**Why Are the Planets So Important?**
In Vedic astrology, each planet governs a different part of your life. The Sun shapes your identity, confidence, and sense of purpose. The Moon governs your emotions, mind, and inner world. Mars influences your drive, courage, and how you handle conflict. Mercury rules communication, intellect, and decision-making. Jupiter brings wisdom, growth, luck, and abundance. Venus shapes love, relationships, beauty, and harmony. Saturn teaches discipline, patience, and life's biggest lessons. Rahu and Ketu, the lunar nodes, reveal karmic patterns, past-life influences, and the deeper lessons your soul is here to learn.

These planets don't work alone. Their positions, the houses they fall into, and the way they interact with each other create a complex, deeply personal picture of who you are and what your life is likely to unfold like. When a planet is strong and well-placed, it tends to bring ease in that area of life. When it's weak, afflicted, or poorly placed, it can show up as recurring struggles, delays, or blocks, often in ways that feel strangely repetitive until you understand the root cause.

**Why Everyone Should Have Their Janam Patri Made**
A Janam Patri isn't just a novelty or a once-in-a-lifetime keepsake, it's a practical tool for understanding yourself and navigating life with more clarity. People turn to their birth chart to understand their core personality, strengths, and natural talents, get clarity on the right timing for major decisions like marriage, career moves, or investments, identify planetary doshas or afflictions that may be causing recurring struggles, understand compatibility before marriage through Kundli matching, recognize karmic patterns and past-life influences shaping present circumstances, and find the right remedies, gemstones, rituals, or spiritual practices to ease difficult planetary periods.

Without your Janam Patri, you're essentially navigating life without a map, reacting to challenges as they come instead of understanding why they keep showing up. With it, patterns that once felt confusing or frustrating often start to make sense.

**Get Your Janam Patri Made Today**
Your birth chart holds insight that no generic horoscope ever could, insight that's personal, precise, and entirely your own. Whether you're seeking clarity on your career, relationships, health, or life's bigger questions, your Janam Patri is where those answers begin.

Book your Janam Patri reading with Divine Wheel of Fortune today and discover what the stars have been trying to tell you all along.`,
    author: "Nattasha Sharrma",
    image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&q=80&w=1200",
    keywords: ["Janam Patri", "Birth Chart", "Kundli", "Vedic Astrology", "Planets", "Astrology Reading"],
    status: "published",
    showOnHomepage: true
  },
  {
    slug: "reiki-healing-gentle-energy-practice",
    title: "Reiki Healing: The Gentle Energy Practice That Helps You Feel Like Yourself Again",
    excerpt: "Discover Reiki Healing and Psychic Reiki Healing, two powerful energy practices that ease stress, clear emotional blocks, and restore balance.",
    content: `There's a particular kind of tired that sleep doesn't fix. You've had eight hours, maybe more, and you still wake up feeling like you're carrying something heavy. Nothing's technically wrong, yet everything feels a little harder than it should. If that sounds familiar, you're not imagining it, and you're definitely not alone. More often than not, what you're feeling isn't just physical. It's energetic. And that's exactly what Reiki was designed to address.

**So, What Actually Is Reiki?**
Reiki is a Japanese healing practice built on a beautifully simple idea, there's a life force energy flowing through every one of us, and when that energy gets blocked, tangled, or drained, we feel it. As stress. As exhaustion. As that nagging sense that something's just off, even when you can't put your finger on why.

A Reiki practitioner doesn't diagnose or fix you like a mechanic would a car. Instead, they act as a calm, steady channel, gently guiding that universal energy back into flow through soft hands-on or hands-near-body touch. Most people say it feels like warmth spreading through the body, or like they finally exhaled a breath they'd been holding for weeks. Nothing is forced. Reiki simply clears the way so your body can do what it already knows how to do, heal itself.

**Why People Keep Coming Back to Reiki**
Here's the thing, you don't need to be falling apart to benefit from Reiki. Most people who try it aren't in crisis, they're just tired of feeling stuck. Maybe stress has been sitting in your shoulders for months. Maybe you're carrying grief you haven't fully processed, or you just can't shake the restlessness at 2am. Maybe you feel blocked, in your career, your relationships, or just in yourself, and you can't explain why.

That's where Reiki meets people. Gently, without judgment, without needing you to have it all figured out first.

**Psychic Reiki Healing: When Energy Work Meets Intuition**
Psychic Reiki takes traditional Reiki a step further. Alongside channeling healing energy, the practitioner also taps into their intuitive and psychic abilities, picking up on subtle messages, blocked emotions, or patterns you may not even be consciously aware of yet.

Think of it this way: regular Reiki clears and balances your energy. Psychic Reiki does that too, but it also listens. It can surface insight about what's really been weighing on you, where a block originated, or what your intuition has been quietly trying to tell you. For people who feel like something deeper is going on beneath the surface, not just stress, but a pattern, a repeated block, an unresolved thread, Psychic Reiki often brings the clarity that regular energy work alone can't reach.

**Feel the Shift for Yourself**
Whether it's the steady calm of traditional Reiki or the deeper insight of Psychic Reiki, both offer something modern life rarely gives us, permission to slow down and actually heal. You don't have to keep pushing through feeling drained, blocked, or disconnected.

Book your Reiki healing session with Divine Wheel of Fortune and start clearing the path back to yourself.`,
    author: "Nattasha Sharrma",
    image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200",
    keywords: ["Reiki Healing", "Psychic Reiki Healing", "Energy Healing", "Emotional Blocks", "Stress Relief"],
    status: "published",
    showOnHomepage: true
  },
  {
    slug: "dragon-reiki-healing-awaken-ancient-power",
    title: "Dragon Reiki Healing: Awaken Ancient Elemental Power for Deep Transformation",
    excerpt: "Discover Dragon Reiki, a rare and powerful healing energy that clears blockages, restores balance, and awakens inner strength.",
    content: `**What Is Dragon Reiki?**
Dragon Reiki is a rare and profoundly powerful branch of energy healing that goes beyond traditional Reiki by channeling the ancient, primal energy of dragons. Across cultures, dragons have long been revered as guardians of wisdom, strength, and transformation. In Dragon Reiki, practitioners connect with these elemental dragon energies, often associated with Earth, Fire, Water, Air, and Spirit, to deliver deep healing on physical, emotional, and spiritual levels.

Unlike gentler forms of energy work, Dragon Reiki is known for its intensity. It does not simply soothe, it actively burns through stagnant energy, emotional blockages, and old patterns that keep a person stuck. This makes it especially powerful for those who feel they have tried other healing modalities without lasting results.

**Why Do People Need Dragon Reiki?**
Modern life leaves many of us carrying invisible weight: stress, anxiety, emotional trauma, low confidence, and a disconnection from our own intuition. Dragon Reiki addresses these root-level blockages rather than just their symptoms. People seek out Dragon Reiki for reasons like releasing deep-seated emotional trauma and restoring inner balance, breaking through fear, self-doubt, and blocks holding back personal or financial growth, reconnecting with their intuition and spiritual purpose, clearing negative or stagnant energy from their body, mind, and surroundings, and building confidence, courage, and inner strength during major life transitions.

Because dragon energy is considered so potent, even a single session can create noticeable shifts, many clients describe feeling lighter, clearer, and more empowered almost immediately afterward.

**What Happens in a Dragon Reiki Session?**
During a Dragon Reiki healing session, a trained practitioner channels elemental dragon energy through hands-on healing, guided visualization, and focused breathwork. Each element brings its own gift, grounding and stability from Earth, passion and transformation from Fire, emotional release from Water, clarity and mental freedom from Air, and deep spiritual connection from Spirit. The session is tailored to what the individual needs most at that moment, making it a deeply personal and often emotional experience.

**Experience the Power of Dragon Reiki with Divine Wheel of Fortune**
At Divine Wheel of Fortune, our Dragon Reiki healing sessions are guided with care, precision, and years of spiritual practice, helping you release what no longer serves you and step into your full power. Whether you are seeking emotional healing, renewed confidence, or a stronger spiritual connection, Dragon Reiki offers a uniquely powerful path forward.

Ready to feel the shift for yourself? Book your Dragon Reiki session with Divine Wheel of Fortune today and awaken the ancient energy waiting within you.`,
    author: "Nattasha Sharrma",
    image: "https://images.unsplash.com/photo-1601662528567-526cd06f363c?q=80&w=1200&auto=format&fit=crop",
    keywords: ["Dragon Reiki", "Dragon Energy", "Elemental Power", "Energy Clearing", "Deep Healing"],
    status: "published",
    showOnHomepage: true
  },
  {
    slug: "mediumship-sacred-conversation",
    title: "Mediumship: A Sacred Conversation With Your Ancestors and Loved Ones",
    excerpt: "Mediumship is the bridge between this world and that one, a sacred conversation that allows healing words to finally be spoken...",
    content: `There is a moment in every mediumship session that I have never gotten used to, in the best way. It is the moment when a client's eyes well up, not from sadness, but from recognition. That is when I know the connection has come through.

I think of a man who once sat across from me, quiet and guarded, clearly unsure if any of this was even real. He had lost his father years earlier and had never really said goodbye. Within minutes of opening the connection, his father came through with a small detail, something so specific and so personal that there was no way I could have known it. A phrase he used to say. A particular habit at the dinner table. The man broke down, not in grief, but in relief. His father was not gone. He was simply on the other side of a very thin veil, still watching, still loving him.

This is the heart of mediumship. Our loved ones and ancestors do not disappear when they pass. Their energy continues, and with the right connection, that energy can still reach us, still comfort us, still guide us. Mediumship is the bridge between this world and that one, a sacred conversation that allows healing words to finally be spoken, questions to finally be answered, and love to keep flowing exactly the way it always did.

Many people come to me carrying unfinished business, words they wish they had said, forgiveness they wish they had asked for or given, or simply a longing to know their loved one is at peace. A mediumship session offers exactly that. It is not about predicting the future. It is about restoring connection, offering closure, and reminding you that love does not end where life does.

If you have ever wished for just one more conversation with someone you lost, or felt your ancestors quietly guiding you from behind the scenes, this is your invitation to listen more closely.

**Open the door to a conversation your heart has been waiting for.**`,
    author: "Nattasha Sharma",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    keywords: ["mediumship reading", "talk to ancestors", "connect with loved ones who passed", "medium session", "Natasha Sharma"],
    status: "published",
    showOnHomepage: true
  },
  {
    slug: "lama-fera-healing",
    title: "Lama Fera Healing: Ancient Himalayan Wisdom for Modern Healing",
    excerpt: "Lama Fera is an ancient Himalayan healing technique, practiced by Buddhist monks for centuries, that uses sacred symbols...",
    content: `**What is Lama Fera?** Lama Fera is an ancient Himalayan healing technique, practiced by Buddhist monks for centuries, that uses sacred symbols and mantras to channel divine healing energy. It is believed to clear negative energy, balance the seven chakras, and support healing on a physical, emotional, and spiritual level.

High in the monasteries of the Himalayas, centuries ago, Buddhist monks discovered something remarkable, a way to channel divine energy through sacred symbols and mantras to heal the body, mind, and spirit. That practice is called Lama Fera, and it is just as powerful today as it was then.

I think of a client who came to me carrying years of unexplained heaviness, not quite sadness, not quite illness, just a persistent sense of being weighed down. Traditional efforts hadn't shifted it. The moment we began a Lama Fera session, invoking those sacred symbols and channeling that ancient healing energy, she described it as feeling like something physically lifted off her shoulders. That heaviness she had carried for years finally had somewhere to go.

Lama Fera works by calling upon powerful, high vibrational healing energy and channeling it through sacred symbols, said to carry the blessings and healing power passed down through generations of Himalayan monks. This energy moves through the practitioner and into the person receiving healing, clearing negative energy, releasing karmic blockages, and restoring balance across the seven chakras.

What makes Lama Fera so powerful is its ability to work on multiple levels at once, easing physical tension, calming emotional turmoil, and awakening spiritual clarity, often within a single session. It doesn't just mask discomfort, it works to clear what's causing it at the root.

If you have been carrying a weight you can't quite explain, or feel like something in your energy has been stuck for far too long, Lama Fera may be exactly the ancient wisdom you need.

**Experience centuries of Himalayan healing wisdom for yourself.**`,
    author: "Nattasha Sharma",
    image: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    keywords: ["Lama Fera healing", "Himalayan healing technique", "chakra balancing", "energy healing", "Natasha Sharma"],
    status: "published",
    showOnHomepage: true
  },
  {
    slug: "akashic-records-reading",
    title: "Akashic Records Reading and Healing: The Soul's Library Holds Every Answer You Seek",
    excerpt: "There is a place beyond time, beyond memory, where every choice you've ever made, every lifetime you've ever lived is recorded...",
    content: `There is a place beyond time, beyond memory, where every choice you've ever made, every lifetime you've ever lived, and every lesson your soul has ever learned is recorded. I call it the soul's library. Others know it as the Akashic Records. And every single time I open this space for a client, I am reminded that nothing about your journey has ever been random.

I remember a woman who came to me feeling completely lost. She had a good life on paper, a stable job, a loving family, yet something inside her felt unfinished, like she was living someone else's script. The moment I opened her Akashic Records, I understood why. Her soul had carried forward a pattern of playing small, of shrinking herself to keep peace, a pattern that stretched across more lifetimes than just this one. Once she saw it, once she truly understood where that pattern came from, something in her shifted. She wasn't broken. She was simply remembering.

This is what an Akashic reading truly offers. It is not fortune telling. It is remembering. Your soul already carries the answers to why certain patterns keep repeating, why certain relationships feel so familiar, why some fears seem bigger than this lifetime alone could explain. When we access the Akashic Records together, we are not guessing about your path, we are reading directly from the source, your soul's own record of truth.

And healing happens right there, in that same sacred space. Once a pattern is seen clearly, it can finally be released. Old vows, old fears, old agreements made in other lifetimes, all of it can be gently cleared, so you are no longer carrying weight that was never truly yours to carry in this life.

If you have ever felt like there is a bigger story behind your struggles, if you sense there is more to understand about who you are and why you are here, your Akashic Records are waiting to be read. This is not about predicting your future. It is about finally understanding your past, so you can walk forward lighter, clearer, and truly free.

**Discover the truth your soul has been waiting for you to remember.**`,
    author: "Nattasha Sharma",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    keywords: ["Akashic records reading", "Akashic healing", "soul records reading", "past life patterns", "Natasha Sharma"],
    status: "published",
    showOnHomepage: true
  }
];

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    for (const blogData of blogsToSeed) {
      const existing = await Blog.findOne({ slug: blogData.slug });
      
      const now = new Date();
      // Adjusting times slightly so they appear in a specific order if sorted by date
      // Latest one first
      const createdAt = new Date(now.getTime() - (blogsToSeed.indexOf(blogData) * 1000 * 60)); 
      
      if (existing) {
        // Update existing
        Object.assign(existing, blogData);
        existing.createdAt = createdAt;
        await existing.save();
        console.log(`Updated: ${blogData.title}`);
      } else {
        const blog = new Blog(blogData);
        blog.createdAt = createdAt;
        await blog.save();
        console.log(`Created: ${blogData.title}`);
      }
    }
    
    console.log('All blogs seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });
