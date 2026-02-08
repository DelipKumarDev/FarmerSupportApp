import {
  Crop,
  CropGuide,
  DiseaseResult,
  FarmProduct,
  ProduceListing,
  Order,
  MarketPrice,
} from '../models/index.js'

// Get all crops
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find()
    res.status(200).json({
      message: 'Crops retrieved successfully',
      count: crops.length,
      crops,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single crop with guides
export const getCropDetail = async (req, res) => {
  try {
    const { id } = req.params
    const crop = await Crop.findById(id)
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' })
    }

    const guides = await CropGuide.find({ cropId: id })
    const prices = await MarketPrice.find({ cropId: id })

    res.status(200).json({
      message: 'Crop details retrieved',
      crop,
      guides,
      prices,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get crop guides
export const getCropGuides = async (req, res) => {
  try {
    const { cropId } = req.query
    let query = {}
    if (cropId) {
      query.cropId = cropId
    }

    const guides = await CropGuide.find(query).populate('cropId')
    res.status(200).json({
      message: 'Crop guides retrieved',
      count: guides.length,
      guides,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create crop guide (admin only)
export const createCropGuide = async (req, res) => {
  try {
    const { cropId, title, content, stage, tips, warnings, fertilizer, irrigation } = req.body

    if (!cropId || !title || !content || !stage) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const guide = await CropGuide.create({
      cropId,
      title,
      content,
      stage,
      tips: tips || [],
      warnings: warnings || [],
      fertilizer: fertilizer || {},
      irrigation: irrigation || {},
      createdBy: req.user.userId,
    })

    res.status(201).json({
      message: 'Crop guide created',
      guide,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get market prices
export const getMarketPrices = async (req, res) => {
  try {
    const { cropId, city } = req.query
    let query = {}
    if (cropId) query.cropId = cropId
    if (city) query['market.city'] = city

    const prices = await MarketPrice.find(query).populate('cropId')
    res.status(200).json({
      message: 'Market prices retrieved',
      count: prices.length,
      prices,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
