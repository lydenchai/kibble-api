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
  { name: 'Cat Food', slug: 'cat-food', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c' },
  { name: 'Cat Treats', slug: 'cat-treats', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba' },
  { name: 'Dog Treats', slug: 'dog-treats', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e' },
  { name: 'Pet Toys', slug: 'pet-toys', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97' },
  { name: 'Pet Beds', slug: 'pet-beds', image: 'https://images.unsplash.com/photo-1541599468348-e96984315921' },
  { name: 'Grooming', slug: 'grooming', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7' },
  { name: 'Collars & Leashes', slug: 'collars-leashes', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1' },
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

    const getId = (slug: string) => insertedCategories.find(c => c.slug === slug)?._id;

    const dogFoodId = getId('dog-food');
    const catFoodId = getId('cat-food');
    const catTreatsId = getId('cat-treats');
    const dogTreatsId = getId('dog-treats');
    const toysId = getId('pet-toys');
    const bedsId = getId('pet-beds');
    const groomingId = getId('grooming');
    const collarsId = getId('collars-leashes');

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
        name: 'Chicken & Rice Puppy Formula',
        slug: 'chicken-rice-puppy-formula',
        description: 'Gentle, easy-to-digest formula designed for growing puppies. Supports healthy development.',
        category: dogFoodId,
        brand: 'KibbleCo',
        petType: 'dog',
        tags: ['puppy', 'chicken', 'sensitive'],
        images: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd'],
        isActive: true,
        variants: [
          { sku: 'KIB-PUP-3KG', price: 22.99, stock: 40, weight: '3kg' },
          { sku: 'KIB-PUP-8KG', price: 42.99, stock: 20, weight: '8kg' }
        ]
      },
      {
        name: 'Grain-Free Salmon Cat Food',
        slug: 'grain-free-salmon-cat-food',
        description: 'Grain-free dry food packed with real salmon for a shiny coat and healthy digestion.',
        category: catFoodId,
        brand: 'WhiskerWorks',
        petType: 'cat',
        tags: ['grain-free', 'salmon', 'adult'],
        images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c'],
        isActive: true,
        variants: [
          { sku: 'CAT-SALM-2KG', price: 18.99, stock: 60, weight: '2kg' },
          { sku: 'CAT-SALM-5KG', price: 36.99, compareAtPrice: 42.99, stock: 25, weight: '5kg' }
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
        name: 'Crunchy Chicken Cat Treats',
        slug: 'crunchy-chicken-cat-treats',
        description: 'Bite-sized crunchy chicken treats, perfect for rewarding good behavior.',
        category: catTreatsId,
        brand: 'PurrfectBites',
        petType: 'cat',
        tags: ['treats', 'chicken', 'crunchy'],
        images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5'],
        isActive: true,
        variants: [
          { sku: 'CHKN-TREAT-100G', price: 6.49, stock: 80, weight: '100g' }
        ]
      },
      {
        name: 'Peanut Butter Dog Biscuits',
        slug: 'peanut-butter-dog-biscuits',
        description: 'Oven-baked biscuits made with real peanut butter. A wholesome everyday treat.',
        category: dogTreatsId,
        brand: 'ToughPaw',
        petType: 'dog',
        tags: ['treats', 'peanut-butter', 'baked'],
        images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'],
        isActive: true,
        variants: [
          { sku: 'PB-BISC-500G', price: 9.99, stock: 70, weight: '500g' }
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
      },
      {
        name: 'Feather Wand Cat Teaser',
        slug: 'feather-wand-cat-teaser',
        description: 'Interactive feather wand toy to keep your cat active and entertained.',
        category: toysId,
        brand: 'WhiskerWorks',
        petType: 'cat',
        tags: ['toy', 'interactive', 'feather'],
        images: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6'],
        isActive: true,
        variants: [
          { sku: 'TOY-WAND-01', price: 7.99, stock: 45 }
        ]
      },
      {
        name: 'Orthopedic Memory Foam Dog Bed',
        slug: 'orthopedic-memory-foam-dog-bed',
        description: 'Supportive memory foam bed that eases pressure on joints. Machine-washable cover.',
        category: bedsId,
        brand: 'ComfyPet',
        petType: 'dog',
        tags: ['bed', 'orthopedic', 'memory-foam'],
        images: ['https://images.unsplash.com/photo-1541599468348-e96984315921'],
        isActive: true,
        variants: [
          { sku: 'BED-ORTHO-M', price: 39.99, stock: 20, size: 'Medium' },
          { sku: 'BED-ORTHO-L', price: 54.99, compareAtPrice: 64.99, stock: 12, size: 'Large' }
        ]
      },
      {
        name: 'Plush Round Cat Bed',
        slug: 'plush-round-cat-bed',
        description: 'Cozy plush bed with raised edges for a sense of security and warmth.',
        category: bedsId,
        brand: 'ComfyPet',
        petType: 'cat',
        tags: ['bed', 'plush', 'cozy'],
        images: ['https://images.unsplash.com/photo-1517423440428-a5a00ad493e8'],
        isActive: true,
        variants: [
          { sku: 'BED-CAT-ROUND', price: 24.99, stock: 30 }
        ]
      },
      {
        name: 'Oatmeal Shampoo for Sensitive Skin',
        slug: 'oatmeal-shampoo-sensitive-skin',
        description: 'Gentle oatmeal-based shampoo that soothes itchy, sensitive skin.',
        category: groomingId,
        brand: 'ComfyPet',
        petType: 'dog',
        tags: ['grooming', 'shampoo', 'sensitive-skin'],
        images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7'],
        isActive: true,
        variants: [
          { sku: 'SHMP-OAT-500ML', price: 12.99, stock: 40, weight: '500ml' }
        ]
      },
      {
        name: 'Self-Cleaning Slicker Brush',
        slug: 'self-cleaning-slicker-brush',
        description: 'Retractable bristle brush that removes loose fur and detangles with one click of cleanup.',
        category: groomingId,
        brand: 'ToughPaw',
        petType: 'both',
        tags: ['grooming', 'brush', 'deshedding'],
        images: ['https://images.unsplash.com/photo-1591946614720-90a587da4a36'],
        isActive: true,
        variants: [
          { sku: 'BRUSH-SLICK-01', price: 15.99, stock: 55 }
        ]
      },
      {
        name: 'Adjustable Nylon Dog Collar',
        slug: 'adjustable-nylon-dog-collar',
        description: 'Durable, weather-resistant nylon collar with quick-release buckle.',
        category: collarsId,
        brand: 'ToughPaw',
        petType: 'dog',
        tags: ['collar', 'nylon', 'adjustable'],
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1'],
        isActive: true,
        variants: [
          { sku: 'COLLAR-S', price: 9.99, stock: 60, size: 'Small' },
          { sku: 'COLLAR-M', price: 11.99, stock: 50, size: 'Medium' },
          { sku: 'COLLAR-L', price: 13.99, stock: 35, size: 'Large' }
        ]
      },
      {
        name: 'Reflective Cat Harness & Leash Set',
        slug: 'reflective-cat-harness-leash-set',
        description: 'Escape-proof harness with reflective stitching for safe evening walks.',
        category: collarsId,
        brand: 'WhiskerWorks',
        petType: 'cat',
        tags: ['harness', 'leash', 'reflective'],
        images: ['https://images.unsplash.com/photo-1601758124096-1c8f0c6f6f3e'],
        isActive: true,
        variants: [
          { sku: 'HARNESS-CAT-S', price: 16.99, stock: 25, size: 'Small' },
          { sku: 'HARNESS-CAT-M', price: 18.99, stock: 20, size: 'Medium' }
        ]
      }
    ];

    await Product.insertMany(products);

    console.log(`Seeding complete! Added ${insertedCategories.length} categories and ${products.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();