const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' }).sort({ sortOrder: 1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.seedCategories = async (req, res) => {
  try {
    // Only allow if empty
    const count = await Category.countDocuments();
    if (count > 0) {
       return res.status(400).json({ success: false, message: 'Categories already seeded' });
    }

    const defaultCategories = [
      { name: "Rudraksha", image: "/images/rudraksha.png", note: "Sacred beads", sortOrder: 1 },
      { name: "Gemstones & Crystals", image: "/images/gemstones_crystals.png", note: "Earth-born energy", sortOrder: 2 },
      { name: "Malas", image: "/images/mala.png", note: "Prayer & practice", sortOrder: 3 },
      { name: "Sacred Books", image: "/images/sacred_book.png", note: "Wisdom for the path", sortOrder: 4 },
      { name: "Power Coins", image: "/images/power_coin.png", note: "Intention talismans", sortOrder: 5 },
      { name: "Astrology Products", image: "/images/astrology_products.png", note: "Cosmic alignment", sortOrder: 6 },
    ];

    await Category.insertMany(defaultCategories);
    res.status(201).json({ success: true, message: 'Categories seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
