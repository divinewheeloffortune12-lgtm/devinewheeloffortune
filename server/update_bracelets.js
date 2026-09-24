const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const generateDescription = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('amethyst')) return 'Embrace tranquility and positive energy. This beautiful stone helps calm the mind, relieve stress, and promote emotional balance and peace.';
  if (lowerName.includes('tiger eye')) return 'Enhance your confidence and inner strength. This powerful stone protects against negative energy while bringing focus, courage, and grounding balance.';
  if (lowerName.includes('black onyx')) return 'Shield yourself with powerful protection. This grounding stone absorbs negative energy, provides emotional stability, and helps you stay deeply centered.';
  if (lowerName.includes('rose quartz')) return 'Attract love, peace, and deep harmony. Known as the stone of unconditional love, it promotes emotional healing and compassionate energy.';
  if (lowerName.includes('citrine')) return 'Invite prosperity, joy, and abundance into your life. This bright stone brings positivity, success, and vibrant energy to your daily journey.';
  if (lowerName.includes('clear quartz')) return 'Experience crystal clarity and healing energy. This master healer amplifies your intentions, cleanses the mind, and brings pure spiritual balance.';
  if (lowerName.includes('lapis lazuli')) return 'Unlock wisdom and your inner truth. This deep blue stone encourages self-awareness, honest communication, and profound peace of mind.';
  if (lowerName.includes('jade')) return 'Attract luck, balance, and prosperity. A beautiful symbol of serenity and purity, it nurtures harmony and brings positive new opportunities.';
  if (lowerName.includes('hematite')) return 'Discover grounding and balanced energy. This protective stone helps absorb toxic emotions, keeping you calm, focused, and securely rooted.';
  if (lowerName.includes('malachite')) return 'Embrace transformation and positive change. This vibrant stone encourages personal growth, emotional healing, and a strong sense of inner power.';
  if (lowerName.includes('obsidian')) return 'Find protection and emotional balance. This powerful shield cleanses negative thoughts, grounds your spirit, and promotes deep self-reflection.';
  if (lowerName.includes('moonstone')) return 'Enhance your intuition and inner harmony. Connected to the moon’s soothing energy, it brings calmness, inspiration, and emotional balance.';
  if (lowerName.includes('labradorite')) return 'Awaken your spiritual magic. This stunning stone protects your aura, boosts intuition, and helps you navigate transitions with ease and confidence.';
  if (lowerName.includes('carnelian')) return 'Ignite your courage, motivation, and vitality. This energetic stone restores lost passion, boosts creativity, and empowers you to take action.';
  if (lowerName.includes('garnet')) return 'Inspire passion, energy, and strength. This revitalizing stone purifies your energy, bringing deep emotional balance and a renewed sense of devotion.';
  if (lowerName.includes('turquoise')) return 'Experience healing, protection, and luck. This ancient stone promotes spiritual grounding, clear communication, and a soothing sense of overall well-being.';
  if (lowerName.includes('amazonite')) return 'Discover hope, calming energy, and harmony. This soothing stone alleviates worry and fear, bringing balance to your emotional state.';
  if (lowerName.includes('fluorite')) return 'Enhance your focus, clarity, and peace. This beautiful crystal clears mental fog, organizes your thoughts, and promotes deep concentration.';
  if (lowerName.includes('sodalite')) return 'Encourage logic, truth, and inner peace. This stone unites logic with intuition, helping you communicate clearly and stay emotionally balanced.';
  if (lowerName.includes('aventurine')) return 'Attract opportunity, luck, and wealth. This optimistic stone opens doors to new possibilities while calming your mind and soothing your spirit.';
  if (lowerName.includes('sunstone')) return 'Radiate joy, vitality, and leadership. This warm, empowering stone clears away dark moods and fills your life with light and positivity.';
  if (lowerName.includes('howlite')) return 'Experience deep calmness and stress relief. This soothing white stone absorbs anxiety, slows an overactive mind, and promotes restful sleep.';
  if (lowerName.includes('rhodonite')) return 'Nurture compassion and emotional healing. This stone helps clear away emotional wounds from the past, bringing unconditional love and forgiveness.';
  if (lowerName.includes('aquamarine')) return 'Find courage and calming energy. This beautiful blue stone washes away stress, quiets the mind, and encourages honest, clear communication.';
  if (lowerName.includes('bloodstone')) return 'Boost your vitality and courage. This powerful healing stone brings physical energy, mental clarity, and the strength to overcome challenges.';
  if (lowerName.includes('pyrite')) return 'Attract wealth and positive energy. This shielding stone acts as a magnet for success, abundance, and strong energetic protection.';
  if (lowerName.includes('tourmaline')) return 'Ensure protection and powerful grounding. This stone is perfect for clearing negative energy, relieving stress, and keeping your aura completely safe.';
  if (lowerName.includes('selenite')) return 'Embrace peace and spiritual clarity. This pure white crystal instantly cleanses your aura, bringing deep tranquility and connection to higher realms.';
  
  return 'Embrace positive energy and beautiful harmony. This uniquely crafted bracelet brings balance, calmness, and a gentle sense of peace to your life.';
};

async function updateBracelets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find the Bracelet category
    const braceletCat = await Category.findOne({ name: { $regex: /bracelet/i } });
    if (!braceletCat) {
      console.log('Bracelet category not found');
      process.exit(1);
    }
    
    console.log(`Found category: ${braceletCat.name} (ID: ${braceletCat._id})`);

    const products = await Product.find({ category: braceletCat._id });
    console.log(`Found ${products.length} bracelet products`);

    let updatedCount = 0;
    for (const product of products) {
      console.log(`\nProduct: ${product.name}`);
      console.log(`Old Description: ${product.description}`);
      
      const newDesc = generateDescription(product.name);
      console.log(`New Description: ${newDesc}`);
      
      product.description = newDesc;
      await product.save();
      updatedCount++;
    }

    console.log(`\nSuccessfully updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateBracelets();
