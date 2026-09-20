require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Service = require('../models/Service');

const dummyNames = [
  "Yogini & Yakshini Sadhak Learning - Astrologer",
  "Tarot Card Reading - 55 Mins",
  "Candle Wax Reading - 30 Mins",
  "Candle Wax Reading - 1 Hr",
  "Smoke Reading",
  "Coffee Cup Reading",
  "Face Reading",
  "Akashic Reading and Healing",
  "Aura Cleansing (Reiki)",
  "Chakra Cleansing & Alignment",
  "Reiki Energy Healing",
  "Astrology Consultation - 30 Mins",
  "Astrology Consultation - 60 Mins",
  "Kundali Matching",
  "Numerology Consultation",
  "Crystal Healing Session",
  "Past Life Regression Therapy",
  "Spiritual Guidance & Counseling"
];

async function removeDummyServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Remove services matching any of the dummy names
    const result = await Service.deleteMany({ name: { $in: dummyNames } });
    
    // Also remove any service containing specific static prices if they were modified
    const resultPrices = await Service.deleteMany({ price: { $in: [22222, 15555, 25555] } });

    process.exit(0);
  } catch (error) {
    console.error('Error removing dummy services:', error);
    process.exit(1);
  }
}

removeDummyServices();
