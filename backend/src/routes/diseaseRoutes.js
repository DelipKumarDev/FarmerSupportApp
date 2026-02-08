import express from 'express'
import {
  detectDisease,
  getDiseaseHistory,
  getDiseaseResult,
} from '../controllers/diseaseController.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Protected routes
router.post('/detect', authMiddleware, upload.single('image'), detectDisease)
router.get('/history', authMiddleware, getDiseaseHistory)
router.get('/:id', authMiddleware, getDiseaseResult)

export default router
