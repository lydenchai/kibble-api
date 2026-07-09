import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kibble';

const categories = [
  { name: 'Dog Food', slug: 'dog-food', image: 'https://images.unsplash.com/photo-1589924691995-400f9b085732' },
  { name: 'Cat Treats', slug: 'cat-treats', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba' },
  { name: 'Pet Toys', slug: 'pet-toys', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97' },
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Clearing existing categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Seeding categories...');
    const insertedCategories = await Category.insertMany(categories);

    const dogFoodId = insertedCategories.find(c => c.slug === 'dog-food')?._id;
    const catTreatsId = insertedCategories.find(c => c.slug === 'cat-treats')?._id;
    const toysId = insertedCategories.find(c => c.slug === 'pet-toys')?._id;

    console.log('Seeding products...');
    const products = [
      {
        name: 'Premium Beef Kibble for Dogs',
        slug: 'premium-beef-kibble',
        description: 'High-protein beef kibble tailored for adult dogs. Rich in vitamins and essential minerals.',
        category: dogFoodId,
        brand: 'KibbleCo',
        petType: 'dog',
        tags: ['premium', 'beef', 'adult'],
        images: ['https://images.unsplash.com/photo-1589924691995-400f9b085732'],
        isActive: true,
        variants: [
          { sku: 'KIB-BEEF-5KG', price: 29.99, compareAtPrice: 34.99, stock: 50, weight: '5kg' },
          { sku: 'KIB-BEEF-10KG', price: 49.99, compareAtPrice: 59.99, stock: 30, weight: '10kg' }
        ]
      },
      {
        name: 'Salmon Bites for Cats',
        slug: 'salmon-bites',
        description: 'Delicious soft salmon treats that your cat will love. Excellent for training or snacking.',
        category: catTreatsId,
        brand: 'PurrfectBites',
        petType: 'cat',
        tags: ['treats', 'salmon', 'soft'],
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'],
        isActive: true,
        variants: [
          { sku: 'SALMON-150G', price: 8.99, compareAtPrice: 10.99, stock: 100, weight: '150g' }
        ]
      },
      {
        name: 'Indestructible Chew Bone',
        slug: 'indestructible-chew-bone',
        description: 'Tough rubber chew bone for aggressive chewers. Keeps dogs engaged for hours.',
        category: toysId,
        brand: 'ToughPaw',
        petType: 'dog',
        tags: ['toy', 'chew', 'durable'],
        images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97'],
        isActive: true,
        variants: [
          { sku: 'TOY-BONE-M', price: 14.99, stock: 25, size: 'Medium' },
          { sku: 'TOY-BONE-L', price: 19.99, stock: 15, size: 'Large' }
        ]
      }
    ];

    await Product.insertMany(products);
    console.log('Seeding complete! Added categories and products.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
