const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const generateDescription = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('amethyst')) return 'Calm Mind & Positive Energy';
  if (lowerName.includes('tiger eye')) return 'Confidence & Inner Strength';
  if (lowerName.includes('black onyx')) return 'Protection & Powerful Energy';
  if (lowerName.includes('rose quartz')) return 'Love, Peace & Harmony';
  if (lowerName.includes('citrine')) return 'Prosperity, Joy & Abundance';
  if (lowerName.includes('clear quartz')) return 'Clarity & Healing Energy';
  if (lowerName.includes('lapis lazuli')) return 'Wisdom & Inner Truth';
  if (lowerName.includes('jade')) return 'Luck, Balance & Prosperity';
  if (lowerName.includes('hematite')) return 'Grounding & Balanced Energy';
  if (lowerName.includes('malachite')) return 'Transformation & Positive Change';
  if (lowerName.includes('obsidian')) return 'Protection & Emotional Balance';
  if (lowerName.includes('moonstone')) return 'Intuition & Inner Harmony';
  if (lowerName.includes('labradorite')) return 'Magic & Spiritual Awakening';
  if (lowerName.includes('carnelian')) return 'Courage, Motivation & Vitality';
  if (lowerName.includes('garnet')) return 'Passion, Energy & Strength';
  if (lowerName.includes('turquoise')) return 'Healing, Protection & Luck';
  if (lowerName.includes('amazonite')) return 'Hope, Calming & Harmony';
  if (lowerName.includes('fluorite')) return 'Focus, Clarity & Peace';
  if (lowerName.includes('sodalite')) return 'Logic, Truth & Inner Peace';
  if (lowerName.includes('aventurine')) return 'Opportunity, Luck & Wealth';
  if (lowerName.includes('sunstone')) return 'Joy, Vitality & Leadership';
  if (lowerName.includes('howlite')) return 'Calmness & Stress Relief';
  if (lowerName.includes('rhodonite')) return 'Compassion & Emotional Healing';
  if (lowerName.includes('aquamarine')) return 'Courage & Calming Energy';
  if (lowerName.includes('bloodstone')) return 'Vitality & Courage';
  if (lowerName.includes('pyrite')) return 'Wealth & Positive Energy';
  if (lowerName.includes('tourmaline')) return 'Protection & Grounding';
  if (lowerName.includes('selenite')) return 'Peace & Spiritual Clarity';
  
  return 'Positive Energy & Harmony'; // Fallback
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
