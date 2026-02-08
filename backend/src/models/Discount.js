import mongoose from 'mongoose'

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide discount code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxUsageCount: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    applicableRoles: [
      {
        type: String,
        enum: ['farmer', 'customer', 'admin'],
      },
    ],
    applicableCrops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Discount', discountSchema)
