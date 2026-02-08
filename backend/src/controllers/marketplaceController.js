import { FarmProduct, ProduceListing, User } from '../models/index.js'

// Create farm product
export const createProduct = async (req, res) => {
  try {
    const {
      cropId,
      productName,
      description,
      quantity,
      basePrice,
      certifications,
      harvestDate,
      storageConditions,
    } = req.body

    if (!cropId || !productName || !quantity || !basePrice) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const product = await FarmProduct.create({
      farmerId: req.user.userId,
      cropId,
      productName,
      description,
      quantity,
      basePrice,
      certifications: certifications || [],
      harvestDate,
      storageConditions,
    })

    res.status(201).json({
      message: 'Product created successfully',
      product,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get farmer's products
export const getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.userId
    const products = await FarmProduct.find({ farmerId })
      .populate('cropId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Farmer products retrieved',
      count: products.length,
      products,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await FarmProduct.findById(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const updated = await FarmProduct.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      message: 'Product updated',
      product: updated,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create marketplace listing
export const createListing = async (req, res) => {
  try {
    const {
      productId,
      title,
      description,
      price,
      minOrder,
      maxOrder,
      availableQuantity,
      listingType,
    } = req.body

    if (!productId || !title || !price) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const listing = await ProduceListing.create({
      farmerId: req.user.userId,
      productId,
      title,
      description,
      price,
      minOrder,
      maxOrder,
      availableQuantity,
      listingType: listingType || 'direct',
    })

    res.status(201).json({
      message: 'Listing created',
      listing,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all active listings
export const getListings = async (req, res) => {
  try {
    const { crop, farmer, minPrice, maxPrice, page = 1 } = req.query
    const limit = 12
    const skip = (page - 1) * limit

    let query = { isActive: true }
    if (crop) query.cropId = crop
    if (farmer) query.farmerId = farmer
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = minPrice
      if (maxPrice) query.price.$lte = maxPrice
    }

    const listings = await ProduceListing.find(query)
      .populate('farmerId', 'name phone city')
      .populate('productId', 'cropId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await ProduceListing.countDocuments(query)

    res.status(200).json({
      message: 'Listings retrieved',
      count: listings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      listings,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get listing details
export const getListingDetail = async (req, res) => {
  try {
    const { id } = req.params
    const listing = await ProduceListing.findById(id)
      .populate('farmerId')
      .populate('productId')

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    res.status(200).json({
      message: 'Listing details retrieved',
      listing,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update listing
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params
    const listing = await ProduceListing.findById(id)

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    if (listing.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const updated = await ProduceListing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      message: 'Listing updated',
      listing: updated,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
