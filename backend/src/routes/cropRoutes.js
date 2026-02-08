import express from 'express'
import {
  getAllCrops,
  getCropDetail,
  getCropGuides,
  createCropGuide,
  getMarketPrices,
} from '../controllers/cropController.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllCrops)
router.get('/guides', getCropGuides)
router.get('/prices', getMarketPrices)
router.get('/:id', getCropDetail)

// Protected routes (admin)
router.post('/guides', authMiddleware, adminMiddleware, createCropGuide)

export default router
