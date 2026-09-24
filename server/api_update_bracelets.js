const https = require('https');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'https://api.divinewheeloffortune.com/api'; // Or is it the main domain?
// Let's use the main domain as that's where the backend is typically hosted if it's not a subdomain.
const API_URL = 'https://www.divinewheeloffortune.com/api';

const generateDescription = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('amethyst')) return 'Calm Mind & Positive Energy';
  if (lowerName.includes('tiger eye')) return 'Confidence & Inner Strength';
  if (lowerName.includes('black onyx') || lowerName.includes('black tourmaline') || lowerName.includes('obsidian')) return 'Protection & Powerful Energy';
  if (lowerName.includes('rose quartz')) return 'Love, Peace & Harmony';
  if (lowerName.includes('citrine') || lowerName.includes('pyrite') || lowerName.includes('magnet')) return 'Prosperity, Joy & Abundance';
  if (lowerName.includes('clear quartz') || lowerName.includes('clean quartz') || lowerName.includes('selenite')) return 'Clarity, Purity & Healing';
  if (lowerName.includes('lapis lazuli') || lowerName.includes('sodalite') || lowerName.includes('kyanite')) return 'Wisdom & Inner Truth';
  if (lowerName.includes('jade') || lowerName.includes('aventurine') || lowerName.includes('emerald')) return 'Luck, Balance & Prosperity';
  if (lowerName.includes('hematite') || lowerName.includes('smoky quartz')) return 'Grounding & Balanced Energy';
  if (lowerName.includes('malachite') || lowerName.includes('moldavite')) return 'Transformation & Positive Change';
  if (lowerName.includes('moonstone')) return 'Intuition & Inner Harmony';
  if (lowerName.includes('labradorite')) return 'Spiritual Magic & Protection';
  if (lowerName.includes('carnelian') || lowerName.includes('ruby')) return 'Courage, Vitality & Action';
  if (lowerName.includes('garnet')) return 'Passion, Energy & Strength';
  if (lowerName.includes('turquoise') || lowerName.includes('amazonite') || lowerName.includes('aquamarine') || lowerName.includes('larimar')) return 'Healing, Peace & Protection';
  if (lowerName.includes('fluorite') || lowerName.includes('howlite')) return 'Focus, Calmness & Clarity';
  if (lowerName.includes('sunstone')) return 'Joy, Vitality & Leadership';
  if (lowerName.includes('rhodonite') || lowerName.includes('rhodochrosite') || lowerName.includes('kunzite')) return 'Compassion & Emotional Healing';
  if (lowerName.includes('bloodstone') || lowerName.includes('peridot') || lowerName.includes('chrysoprase')) return 'Vitality, Courage & Growth';
  if (lowerName.includes('chakra') || lowerName.includes('reunion') || lowerName.includes('favourable')) return 'Balance, Peace & Spiritual Alignment';
  if (lowerName.includes('glacierite') || lowerName.includes('azurite')) return 'Soothing Energy & Deep Wisdom';
  
  return 'Positive Energy & Beautiful Harmony';
};

async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

    const token = loginRes.data.token;
    console.log('Logged in successfully.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Fetching categories...');
    const catRes = await axios.get(`${API_URL}/categories`, { headers });
    const braceletCat = catRes.data.data.find(c => c.name.toLowerCase().includes('bracelet'));

    if (!braceletCat) {
      console.log('Bracelet category not found.');
      return;
    }

    console.log(`Found category: ${braceletCat.name}`);

    console.log('Fetching products...');
    let allProducts = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const prodRes = await axios.get(`${API_URL}/admin/products?page=${page}&limit=50&category=${braceletCat._id}`, { headers });
      allProducts = allProducts.concat(prodRes.data.data);
      totalPages = prodRes.data.totalPages || 1;
      page++;
    }

    console.log(`Found ${allProducts.length} bracelets.`);

    for (const product of allProducts) {
      const newDesc = generateDescription(product.name);
      console.log(`Updating ${product.name}...`);
      
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('slug', product.slug);
      formData.append('category', braceletCat._id);
      formData.append('price', product.price);
      formData.append('discount', product.discount);
      formData.append('stock', product.stock);
      formData.append('description', newDesc);
      formData.append('isShippingRequired', product.isShippingRequired);
      formData.append('freeShipping', product.freeShipping);
      if (product.shippingCharge) formData.append('shippingCharge', product.shippingCharge);
      
      if (product.images && product.images.length > 0) {
        formData.append('existingImages', JSON.stringify(product.images));
      }

      try {
        const response = await fetch(`${API_URL}/admin/products/${product._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errData = await response.text();
          throw new Error(errData);
        }
        
        console.log(`Successfully updated ${product.name}`);
      } catch (err) {
        console.log(`Failed to update ${product.name}: ${err.message}`);
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error(error.message);
  }
}

run();
