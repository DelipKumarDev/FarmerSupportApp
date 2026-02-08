import { Discount } from '../models/index.js'

// Create discount code
export const createDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxUsageCount,
      applicableRoles,
      applicableCrops,
      startDate,
      endDate,
    } = req.body

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check if code already exists
    const existing = await Discount.findOne({ code: code.toUpperCase() })
    if (existing) {
      return res.status(400).json({ message: 'Discount code already exists' })
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxUsageCount,
      applicableRoles: applicableRoles || [],
      applicableCrops: applicableCrops || [],
      startDate,
      endDate,
      createdBy: req.user.userId,
    })

    res.status(201).json({
      message: 'Discount created',
      discount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all discounts
export const getDiscounts = async (req, res) => {
  try {
    const { active, page = 1 } = req.query
    const limit = 10
    const skip = (page - 1) * limit

    let query = {}
    if (active === 'true') {
      query.isActive = true
      query.endDate = { $gte: new Date() }
    }

    const discounts = await Discount.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Discount.countDocuments(query)

    res.status(200).json({
      message: 'Discounts retrieved',
      count: discounts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      discounts,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get discount detail
export const getDiscountDetail = async (req, res) => {
  try {
    const { id } = req.params
    const discount = await Discount.findById(id).populate('createdBy', 'name email')

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    res.status(200).json({
      message: 'Discount retrieved',
      discount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Validate discount code
export const validateDiscount = async (req, res) => {
  try {
    const { code, role } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code is required' })
    }

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!discount) {
      return res.status(404).json({ message: 'Invalid or expired discount code' })
    }

    // Check role applicability
    if (
      discount.applicableRoles.length > 0 &&
      !discount.applicableRoles.includes(role)
    ) {
      return res.status(400).json({ message: 'This code is not applicable to your role' })
    }

    // Check usage limit
    if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
      return res.status(400).json({ message: 'Discount code usage limit reached' })
    }

    res.status(200).json({
      message: 'Discount code valid',
      discount: {
        id: discount._id,
        code: discount.code,
        type: discount.discountType,
        value: discount.discountValue,
        minAmount: discount.minOrderAmount,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update discount
export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params
    const { description, minOrderAmount, isActive, endDate } = req.body

    const discount = await Discount.findByIdAndUpdate(
      id,
      {
        ...(description && { description }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(isActive !== undefined && { isActive }),
        ...(endDate && { endDate }),
      },
      { new: true, runValidators: true }
    )

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    res.status(200).json({
      message: 'Discount updated',
      discount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Deactivate discount
export const deactivateDiscount = async (req, res) => {
  try {
    const { id } = req.params
    const discount = await Discount.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    res.status(200).json({
      message: 'Discount deactivated',
      discount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
