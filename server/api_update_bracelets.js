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
