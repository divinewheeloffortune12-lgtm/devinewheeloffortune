require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service');

const servicesData = [
  { name: "Astrologer", duration: "Standard", price: 22222 },
  { name: "Astro+ Numerology + tarot card", duration: "Standard", price: 33333 },
  { name: "Asto + palm + tarot card", duration: "Standard", price: 33333 },
  { name: "TARRO- 1 Question", duration: "Standard", price: 3333 },
  { name: "TARRO - 30 mins", duration: "30 mins", price: 15555 },
  { name: "TARRO - 55Min", duration: "55 mins", price: 22222 },
  { name: "Rice Kodi Gomti chakra and crystal reading", duration: "Standard", price: 11111 },
  { name: "Candel flame Reading - 30 mins", duration: "30 mins", price: 11111 },
  { name: "Sand Reading - 30 mins", duration: "30 mins", price: 11111 },
  { name: "Flowers reading - 30 mins", duration: "30 mins", price: 11111 },
  { name: "Crayon reading - 30 mins", duration: "30 mins", price: 9999 },
  { name: "Candel wax reading - 30 mins", duration: "30 mins", price: 15555 },
  { name: "Candel wax reading - 1hr", duration: "55 mins", price: 25555 },
  { name: "Smoke Reading - 55 mins", duration: "55 mins", price: 22222 },
  { name: "Termeric-Haldi Reading - 30 mins", duration: "30 mins", price: 12222 },
  { name: "Soul healing - 55 min", duration: "55 mins", price: 33333 },
  { name: "Sound therepy -healing - 30 min", duration: "30 mins", price: 15555 },
  { name: "Law of attration Coach - 30mins", duration: "30 mins", price: 13333 },
  { name: "Reiki heeling - 25 mins", duration: "25 mins", price: 33333 },
  { name: "Rekiki pyscki surgery - 30 mins", duration: "30 mins", price: 755555 },
  { name: "Medium SHIP(Talk to Ancestors/ Loved one) - 55mins", duration: "55 mins", price: 33333 },
  { name: "Money rekki 1session - 20 mins", duration: "20 mins", price: 111111 },
  { name: "Crystal Ball reading - 1Hr", duration: "55 mins", price: 25555 },
  { name: "Coffee cup reading Psycic Valution session - 45 mins", duration: "45 mins", price: 19999 },
  { name: "Akashik Reading and healing - 20Min", duration: "20 mins", price: 22222 },
  { name: "Akashik Reading and healing - 3 session package", duration: "3 sessions", price: 188888 },
  { name: "Akashasih heeling - 45min", duration: "45 mins", price: 55555 },
  { name: "PAST LIFE regression - 10 min general Mandatory", duration: "10 mins", price: 55555 },
  { name: "PAST LIFE regression - 55mins", duration: "55 mins", price: 255555 }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI is not set in .env. Attempting to connect to local MongoDB if available, otherwise please provide URI.");
    }
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology');
    console.log("Connected to MongoDB.");

    console.log("Clearing existing services...");
    await Service.deleteMany({});
    
    console.log("Inserting new services...");
    await Service.insertMany(servicesData);
    
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed services:", err);
    process.exit(1);
  }
};

seedDB();
