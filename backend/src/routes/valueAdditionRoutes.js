import express from 'express'
import {
  createContent,
  getAllContent,
  getContentDetail,
  updateContent,
  deleteContent,
  getContentByCategory,
} from '../controllers/valueAdditionController.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllContent)
router.get('/:id', getContentDetail)
router.get('/category/:category', getContentByCategory)

// Protected routes (admin)
router.post('/', authMiddleware, adminMiddleware, createContent)
router.put('/:id', authMiddleware, adminMiddleware, updateContent)
router.delete('/:id', authMiddleware, adminMiddleware, deleteContent)

export default router
