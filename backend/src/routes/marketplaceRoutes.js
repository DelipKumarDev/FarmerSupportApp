import express from 'express'
import {
  createProduct,
  getFarmerProducts,
  updateProduct,
  createListing,
  getListings,
  getListingDetail,
  updateListing,
} from '../controllers/marketplaceController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Farm product routes (farmer only)
router.post('/products', authMiddleware, createProduct)
router.get('/products', authMiddleware, getFarmerProducts)
router.put('/products/:id', authMiddleware, updateProduct)

// Marketplace listing routes
router.post('/listings', authMiddleware, createListing)
router.get('/listings', getListings)
router.get('/listings/:id', getListingDetail)
router.put('/listings/:id', authMiddleware, updateListing)

export default router
