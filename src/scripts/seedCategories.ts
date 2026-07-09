import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Category } from '../models/Category';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kibble';

const moreCategories = [
  { name: 'Dog Accessories', slug: 'dog-accessories', image: 'https://images.unsplash.com/photo-1602958169883-0161427c36a4' },
  { name: 'Cat Litter & Accessories', slug: 'cat-litter', image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7' },
  { name: 'Bird Cages & Toys', slug: 'bird-cages', image: 'https://images.unsplash.com/photo-1552728089-571692ac82c6' },
  { name: 'Fish Aquariums', slug: 'fish-aquariums', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5' },
  { name: 'Reptile Habitats', slug: 'reptile-habitats', image: 'https://images.unsplash.com/photo-1506469717960-433cebe3f181' },
  { name: 'Small Pet Food', slug: 'small-pet-food', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd0999c' },
  { name: 'Grooming Supplies', slug: 'grooming-supplies', image: 'https://images.unsplash.com/photo-1516734212443-3e3a479ff703' },
  { name: 'Flea & Tick Prevention', slug: 'flea-and-tick', image: 'https://images.unsplash.com/photo-1596700813959-19ec41d8eeb6' }
];

const seedCategories = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Seeding additional categories...');
    
    for (const cat of moreCategories) {
      // Use updateOne with upsert to avoid duplicate key errors on slug
      await Category.updateOne(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true }
      );
      console.log(`Seeded category: ${cat.name}`);
    }

    console.log('Seeding complete! Added more categories.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
