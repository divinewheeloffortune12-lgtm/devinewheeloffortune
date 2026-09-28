const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Blog = require('./src/models/Blog');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await Blog.updateMany({ slug: 'what-is-dragon-reiki' }, { image: 'https://images.unsplash.com/photo-1507676184212-d0c30a512d7c?auto=format&fit=crop&w=1200&q=80' });
    await Blog.updateMany({ slug: 'dragon-reiki-healing-awaken-ancient-power' }, { image: 'https://images.unsplash.com/photo-1515589654160-7080e77d7045?auto=format&fit=crop&w=1200&q=80' });
    console.log('Updated');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
