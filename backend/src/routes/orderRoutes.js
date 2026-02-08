import express from 'express'
import {
  createOrder,
  getCustomerOrders,
  getFarmerOrders,
  getOrderDetail,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Protected routes
router.post('/create', authMiddleware, createOrder)
router.get('/my-orders', authMiddleware, getCustomerOrders)
router.get('/farmer-orders', authMiddleware, getFarmerOrders)
router.get('/:id', authMiddleware, getOrderDetail)
router.put('/:id/status', authMiddleware, updateOrderStatus)

export default router
