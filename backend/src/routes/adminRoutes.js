import express from 'express'
import {
  getAllUsers,
  getUserDetail,
  updateUser,
  deactivateUser,
  getDashboardStats,
} from '../controllers/adminController.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All routes require admin authentication
router.use(authMiddleware, adminMiddleware)

// Dashboard
router.get('/dashboard/stats', getDashboardStats)

// User management
router.get('/users', getAllUsers)
router.get('/users/:id', getUserDetail)
router.put('/users/:id', updateUser)
router.post('/users/:id/deactivate', deactivateUser)

export default router
