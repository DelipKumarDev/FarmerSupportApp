import dotenv from 'dotenv'
import connectDatabase from './config/database.js'
import {
  User,
  Crop,
  CropGuide,
  DiseaseResult,
  FarmProduct,
  ProduceListing,
  Order,
  MarketPrice,
  Discount,
  ValueAdditionContent,
} from './src/models/index.js'

dotenv.config()

const seedDatabase = async () => {
  try {
    await connectDatabase()
    console.log('Starting database seeding...')

    // Clear existing data
    await User.deleteMany({})
    await Crop.deleteMany({})
    await CropGuide.deleteMany({})
    await Discount.deleteMany({})
    await MarketPrice.deleteMany({})
    console.log('Cleared existing data')

    // CreateUsers
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@farmersupport.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
      city: 'Delhi',
      state: 'Delhi',
    })

    const farmer1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@farmer.com',
      password: 'farmer123',
      role: 'farmer',
      phone: '9876543210',
      address: 'Village Haryana',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121001',
      farmSize: 15,
    })

    const farmer2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@farmer.com',
      password: 'farmer123',
      role: 'farmer',
      phone: '9876543211',
      address: 'Village Punjab',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      farmSize: 20,
    })

    const customer1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@customer.com',
      password: 'customer123',
      role: 'customer',
      phone: '9876543212',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    })

    const customer2 = await User.create({
      name: 'Neha Gupta',
      email: 'neha@customer.com',
      password: 'customer123',
      role: 'customer',
      phone: '9876543213',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    })

    console.log('Created 5 users')

    // Create Crops
    const wheat = await Crop.create({
      name: 'Wheat',
      scientificName: 'Triticum aestivum',
      description: 'Winter cereal crop',
      season: 'rabi',
      soilType: ['loamy', 'clay loam'],
      temperature: { min: 10, max: 25 },
      rainfall: { min: 450, max: 600 },
      growthDays: 120,
    })

    const rice = await Crop.create({
      name: 'Rice',
      scientificName: 'Oryza sativa',
      description: 'Monsoon season crop',
      season: 'kharif',
      soilType: ['clay', 'loamy'],
      temperature: { min: 20, max: 32 },
      rainfall: { min: 800, max: 1200 },
      growthDays: 150,
    })

    const cotton = await Crop.create({
      name: 'Cotton',
      scientificName: 'Gossypium',
      description: 'Cash crop',
      season: 'kharif',
      soilType: ['black soil', 'loamy'],
      temperature: { min: 21, max: 30 },
      rainfall: { min: 500, max: 800 },
      growthDays: 180,
    })

    const tomato = await Crop.create({
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      description: 'Vegetable crop',
      season: 'summer',
      soilType: ['sandy loam', 'loam'],
      temperature: { min: 15, max: 30 },
      rainfall: { min: 400, max: 600 },
      growthDays: 70,
    })

    console.log('Created 4 crops')

    // Create Crop Guides
    await CropGuide.create({
      cropId: wheat._id,
      title: 'Wheat Cultivation Guide',
      content: 'Detailed guide for wheat farming',
      stage: 'preparation',
      tips: [
        'Plow field 3 times',
        'Use quality seeds',
        'Maintain moisture',
      ],
      warnings: ['Avoid waterlogging', 'Check for pests regularly'],
      fertilizer: {
        name: 'NPK 20:20:0',
        quantity: '25 kg',
        time: 'Before sowing',
      },
      irrigation: {
        frequency: 'Every 20-25 days',
        quantity: '5-6 cm',
      },
      createdBy: adminUser._id,
    })

    await CropGuide.create({
      cropId: rice._id,
      title: 'Rice Cultivation Guide',
      content: 'Detailed guide for rice farming',
      stage: 'sowing',
      tips: [
        'Use certified seeds',
        'Maintain water level',
        'Control weeds',
      ],
      warnings: ['Avoid excess nitrogen', 'Monitor for diseases'],
      fertilizer: {
        name: 'NPK 10:26:26',
        quantity: '50 kg',
        time: 'During planting',
      },
      irrigation: {
        frequency: 'Continuous',
        quantity: '5-7 cm',
      },
      createdBy: adminUser._id,
    })

    console.log('Created 2 crop guides')

    // Create Discounts
    await Discount.create({
      code: 'FARAUG25',
      description: 'August festival discount for farmers',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 500,
      maxUsageCount: 100,
      applicableRoles: ['farmer'],
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-31'),
      isActive: true,
      createdBy: adminUser._id,
    })

    await Discount.create({
      code: 'FLAT500',
      description: 'Flat 500 discount on orders above 2000',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 2000,
      applicableRoles: ['customer'],
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      createdBy: adminUser._id,
    })

    console.log('Created 2 discounts')

    // Create Market Prices
    const wheatPrices = [
      {
        cropId: wheat._id,
        market: {
          name: 'Delhi Mandi',
          city: 'Delhi',
          state: 'Delhi',
        },
        minPrice: 2400,
        maxPrice: 2500,
        avgPrice: 2450,
        quantity: { amount: 1, unit: 'quintal' },
        trend: 'up',
      },
      {
        cropId: wheat._id,
        market: {
          name: 'Jaipur Mandi',
          city: 'Jaipur',
          state: 'Rajasthan',
        },
        minPrice: 2300,
        maxPrice: 2400,
        avgPrice: 2350,
        quantity: { amount: 1, unit: 'quintal' },
        trend: 'stable',
      },
    ]

    const ricePrices = [
      {
        cropId: rice._id,
        market: {
          name: 'Chennai Mandi',
          city: 'Chennai',
          state: 'Tamil Nadu',
        },
        minPrice: 3800,
        maxPrice: 4000,
        avgPrice: 3900,
        quantity: { amount: 1, unit: 'quintal' },
        trend: 'down',
      },
      {
        cropId: rice._id,
        market: {
          name: 'Kolkata Mandi',
          city: 'Kolkata',
          state: 'West Bengal',
        },
        minPrice: 3900,
        maxPrice: 4100,
        avgPrice: 4000,
        quantity: { amount: 1, unit: 'quintal' },
        trend: 'up',
      },
    ]

    await MarketPrice.insertMany([...wheatPrices, ...ricePrices])
    console.log('Created market prices')

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
