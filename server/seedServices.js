const mongoose = require('mongoose');
const Service = require('./src/models/Service');
require('dotenv').config();

const predefinedServices = [
  { name: "Yogini & Yakshini Sadhak Learning - Astrologer", price: 22222, duration: "TBD" },
  { name: "Astro + Numerology + Tarot Card", price: 33333, duration: "TBD" },
  { name: "Astro + Palm + Tarot Card", price: 33333, duration: "TBD" },
  { name: "Tarot Card Reading - 1 Question", price: 3333, duration: "TBD" },
  { name: "Tarot Card Reading - 30 Mins", price: 15555, duration: "30 mins" },
  { name: "Tarot Card Reading - 55 Mins", price: 22222, duration: "55 mins" },
  { name: "Rice Kodi Gomti Chakra and Crystal Healing", price: 11111, duration: "TBD" },
  { name: "Candle Flame Reading", price: 11111, duration: "30 mins" },
  { name: "Sand Reading", price: 11111, duration: "30 mins" },
  { name: "Flowers Reading", price: 11111, duration: "30 mins" },
  { name: "Crayon Reading", price: 9999, duration: "30 mins" },
  { name: "Candle Wax Reading - 30 Mins", price: 15555, duration: "30 mins" },
  { name: "Candle Wax Reading - 1 Hr", price: 25555, duration: "60 mins" },
  { name: "Smoke Reading", price: 22222, duration: "55 mins" },
  { name: "Turmeric-Haldi Reading", price: 12222, duration: "30 mins" },
  { name: "Soul Healing - 55 Mins", price: 33333, duration: "55 mins" },
  { name: "Soul Healing - Premium", price: 45555, duration: "TBD" },
  { name: "Sound Therapy Healing", price: 15555, duration: "30 mins" },
  { name: "Law of Attraction Coach", price: 13333, duration: "30 mins" },
  { name: "Reiki Healing", price: 33333, duration: "25 mins" },
  { name: "Reiki Psychic Surgery", price: 755555, duration: "30 mins" },
  { name: "Mediumship (Talk to Ancestors/Loved Ones)", price: 33333, duration: "55 mins" },
  { name: "Money Reiki - 1 Session", price: 111111, duration: "20 mins" },
  { name: "Crystal Ball Reading - Video Call", price: 25555, duration: "60 mins" },
  { name: "Coffee Cup Reading Psychic Valuation Session", price: 19999, duration: "45 mins" },
  { name: "Akashic Reading and Healing", price: 22222, duration: "20 mins" },
  { name: "Akashic Reading and Healing - 3 Session Package", price: 188888, duration: "3 Sessions" },
  { name: "Akashic Healing - 45 Mins", price: 55555, duration: "45 mins" },
  { name: "Past Life Regression - 10 Min General (Mandatory)", price: 55555, duration: "10 mins" },
  { name: "Past Life Regression - 55 Mins", price: 255555, duration: "55 mins" }
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("No MONGODB_URI provided, skipping service seed.");
      process.exit(0);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB for seeding services...");

    for (const srv of predefinedServices) {
      await Service.findOneAndUpdate(
        { name: srv.name }, 
        { $set: { price: srv.price, duration: srv.duration, isActive: true } }, 
        { upsert: true, new: true }
      );
    }
    
    console.log("Services strictly verified and synchronized!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(0); 
  }
}

seed();
