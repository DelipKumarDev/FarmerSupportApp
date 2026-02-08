import { ValueAdditionContent } from '../models/index.js'

// Create value addition content
export const createContent = async (req, res) => {
  try {
    const {
      title,
      description,
      cropId,
      category,
      content,
      steps,
      benefits,
      equipment,
      requiredSkills,
      estimatedCost,
      expectedReturn,
      videoUrl,
      relatedLinks,
    } = req.body

    if (!title || !description || !category || !content) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const valueContent = await ValueAdditionContent.create({
      title,
      description,
      cropId,
      category,
      content,
      steps: steps || [],
      benefits: benefits || [],
      equipment: equipment || [],
      requiredSkills: requiredSkills || [],
      estimatedCost: estimatedCost || {},
      expectedReturn: expectedReturn || {},
      videoUrl,
      relatedLinks: relatedLinks || [],
      createdBy: req.user.userId,
      isApproved: true, // Admin auto-approves
    })

    res.status(201).json({
      message: 'Value addition content created',
      content: valueContent,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all value addition content
export const getAllContent = async (req, res) => {
  try {
    const { category, cropId, approved = true, page = 1 } = req.query
    const limit = 12
    const skip = (page - 1) * limit

    let query = {}
    if (approved !== 'false') query.isApproved = true
    if (category) query.category = category
    if (cropId) query.cropId = cropId

    const content = await ValueAdditionContent.find(query)
      .populate('cropId', 'name')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await ValueAdditionContent.countDocuments(query)

    res.status(200).json({
      message: 'Value addition content retrieved',
      count: content.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get content detail
export const getContentDetail = async (req, res) => {
  try {
    const { id } = req.params
    const content = await ValueAdditionContent.findById(id)
      .populate('cropId', 'name description')
      .populate('createdBy', 'name email')

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    if (!content.isApproved) {
      return res.status(403).json({ message: 'Content not approved' })
    }

    res.status(200).json({
      message: 'Content retrieved',
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update content
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      content,
      steps,
      benefits,
      equipment,
      estimatedCost,
      expectedReturn,
    } = req.body

    const valueContent = await ValueAdditionContent.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content }),
        ...(steps && { steps }),
        ...(benefits && { benefits }),
        ...(equipment && { equipment }),
        ...(estimatedCost && { estimatedCost }),
        ...(expectedReturn && { expectedReturn }),
      },
      { new: true, runValidators: true }
    )

    if (!valueContent) {
      return res.status(404).json({ message: 'Content not found' })
    }

    res.status(200).json({
      message: 'Content updated',
      content: valueContent,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete content
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params
    const content = await ValueAdditionContent.findByIdAndDelete(id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    res.status(200).json({
      message: 'Content deleted',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get content by category
export const getContentByCategory = async (req, res) => {
  try {
    const { category } = req.params

    const categories = [
      'processing',
      'packaging',
      'storage',
      'branding',
      'certification',
    ]
    if (!categories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' })
    }

    const content = await ValueAdditionContent.find({
      category,
      isApproved: true,
    })
      .populate('cropId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Content retrieved',
      category,
      count: content.length,
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
