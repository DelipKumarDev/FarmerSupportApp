import express from 'express'
import {
  createDiscount,
  getDiscounts,
  getDiscountDetail,
  validateDiscount,
  updateDiscount,
  deactivateDiscount,
} from '../controllers/discountController.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public route - validate discount
router.post('/validate', validateDiscount)

// Protected routes (admin)
router.use(authMiddleware, adminMiddleware)

router.post('/', createDiscount)
router.get('/', getDiscounts)
router.get('/:id', getDiscountDetail)
router.put('/:id', updateDiscount)
router.post('/:id/deactivate', deactivateDiscount)

export default router
