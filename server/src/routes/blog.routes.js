const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

router.get('/', blogController.getBlogs);
router.post('/seed-temp', async (req, res) => {
  const Blog = require('../models/Blog');
  const blogs = [
  {
    title: "Akashic Records Reading and Healing: The Soul's Library Holds Every Answer You Seek",
    slug: "akashic-records-reading-healing",
    excerpt: "There is a place beyond time, beyond memory, where every choice you've ever made, every lifetime you've ever lived, and every lesson your soul has ever learned is recorded. I call it the soul's library.",
    content: "There is a place beyond time, beyond memory, where every choice you've ever made, every lifetime you've ever lived, and every lesson your soul has ever learned is recorded. I call it the soul's library. Others know it as the Akashic Records. And every single time I open this space for a client, I am reminded that nothing about your journey has ever been random.\n\nI remember a woman who came to me feeling completely lost. She had a good life on paper, a stable job, a loving family, yet something inside her felt unfinished, like she was living someone else's script. The moment I opened her Akashic Records, I understood why. Her soul had carried forward a pattern of playing small, of shrinking herself to keep peace, a pattern that stretched across more lifetimes than just this one. Once she saw it, once she truly understood where that pattern came from, something in her shifted. She wasn't broken. She was simply remembering.\n\nThis is what an Akashic reading truly offers. It is not fortune telling. It is remembering. Your soul already carries the answers to why certain patterns keep repeating, why certain relationships feel so familiar, why some fears seem bigger than this lifetime alone could explain. When we access the Akashic Records together, we are not guessing about your path, we are reading directly from the source, your soul's own record of truth.\n\nAnd healing happens right there, in that same sacred space. Once a pattern is seen clearly, it can finally be released. Old vows, old fears, old agreements made in other lifetimes, all of it can be gently cleared, so you are no longer carrying weight that was never truly yours to carry in this life.\n\nIf you have ever felt like there is a bigger story behind your struggles, if you sense there is more to understand about who you are and why you are here, your Akashic Records are waiting to be read. This is not about predicting your future. It is about finally understanding your past, so you can walk forward lighter, clearer, and truly free.",
    author: "Natasha Sharma",
    keywords: ["Akashic Records", "Healing"],
    status: "published",
    image: "/images/mala.png"
  },
  {
    title: "Lama Fera Healing: Ancient Himalayan Wisdom for Modern Healing",
    slug: "lama-fera-healing",
    excerpt: "Lama Fera is an ancient Himalayan healing technique, practiced by Buddhist monks for centuries, that uses sacred symbols and mantras to channel divine healing energy.",
    content: "What is Lama Fera? Lama Fera is an ancient Himalayan healing technique, practiced by Buddhist monks for centuries, that uses sacred symbols and mantras to channel divine healing energy. It is believed to clear negative energy, balance the seven chakras, and support healing on a physical, emotional, and spiritual level.\n\nHigh in the monasteries of the Himalayas, centuries ago, Buddhist monks discovered something remarkable, a way to channel divine energy through sacred symbols and mantras to heal the body, mind, and spirit. That practice is called Lama Fera, and it is just as powerful today as it was then.\n\nI think of a client who came to me carrying years of unexplained heaviness, not quite sadness, not quite illness, just a persistent sense of being weighed down. Traditional efforts hadn't shifted it. The moment we began a Lama Fera session, invoking those sacred symbols and channeling that ancient healing energy, she described it as feeling like something physically lifted off her shoulders. That heaviness she had carried for years finally had somewhere to go.\n\nLama Fera works by calling upon powerful, high vibrational healing energy and channeling it through sacred symbols, said to carry the blessings and healing power passed down through generations of Himalayan monks. This energy moves through the practitioner and into the person receiving healing, clearing negative energy, releasing karmic blockages, and restoring balance across the seven chakras.\n\nWhat makes Lama Fera so powerful is its ability to work on multiple levels at once, easing physical tension, calming emotional turmoil, and awakening spiritual clarity, often within a single session. It doesn't just mask discomfort, it works to clear what's causing it at the root.\n\nIf you have been carrying a weight you can't quite explain, or feel like something in your energy has been stuck for far too long, Lama Fera may be exactly the ancient wisdom you need.",
    author: "Natasha Sharma",
    keywords: ["Lama Fera", "Healing", "Himalayan"],
    status: "published",
    image: "/images/mala.png"
  },
  {
    title: "Mediumship: A Sacred Conversation With Your Ancestors and Loved Ones",
    slug: "mediumship-sacred-conversation",
    excerpt: "There is a moment in every mediumship session that I have never gotten used to, in the best way. It is the moment when a client's eyes well up, not from sadness, but from recognition.",
    content: "There is a moment in every mediumship session that I have never gotten used to, in the best way. It is the moment when a client's eyes well up, not from sadness, but from recognition. That is when I know the connection has come through.\n\nI think of a man who once sat across from me, quiet and guarded, clearly unsure if any of this was even real. He had lost his father years earlier and had never really said goodbye. Within minutes of opening the connection, his father came through with a small detail, something so specific and so personal that there was no way I could have known it. A phrase he used to say. A particular habit at the dinner table. The man broke down, not in grief, but in relief. His father was not gone. He was simply on the other side of a very thin veil, still watching, still loving him.\n\nThis is the heart of mediumship. Our loved ones and ancestors do not disappear when they pass. Their energy continues, and with the right connection, that energy can still reach us, still comfort us, still guide us. Mediumship is the bridge between this world and that one, a sacred conversation that allows healing words to finally be spoken, questions to finally be answered, and love to keep flowing exactly the way it always did.\n\nMany people come to me carrying unfinished business, words they wish they had said, forgiveness they wish they had asked for or given, or simply a longing to know their loved one is at peace. A mediumship session offers exactly that. It is not about predicting the future. It is about restoring connection, offering closure, and reminding you that love does not end where life does.\n\nIf you have ever wished for just one more conversation with someone you lost, or felt your ancestors quietly guiding you from behind the scenes, this is your invitation to listen more closely.",
    author: "Natasha Sharma",
    keywords: ["Mediumship", "Ancestors", "Connection"],
    status: "published",
    image: "/images/mala.png"
  }
  ];
  await Blog.deleteMany({});
  await Blog.insertMany(blogs);
  res.json({ success: true, message: 'Seeded' });
});
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
