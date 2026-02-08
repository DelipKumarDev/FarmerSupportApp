import mongoose from 'mongoose'

const valueAdditionContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide content title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide content description'],
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
    },
    category: {
      type: String,
      enum: ['processing', 'packaging', 'storage', 'branding', 'certification'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    steps: [
      {
        stepNumber: Number,
        title: String,
        description: String,
        tips: [String],
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    equipment: [
      {
        name: String,
        cost: Number,
        supplier: String,
      },
    ],
    requiredSkills: [
      {
        type: String,
      },
    ],
    estimatedCost: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    expectedReturn: {
      percentage: Number,
      description: String,
    },
    images: [
      {
        type: String,
      },
    ],
    videoUrl: String,
    relatedLinks: [
      {
        title: String,
        url: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model(
  'ValueAdditionContent',
  valueAdditionContentSchema
)
