import mongoose from 'mongoose'

const farmProductSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    productName: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      amount: Number,
      unit: {
        type: String,
        enum: ['kg', 'quintals', 'tons', 'liters'],
        default: 'kg',
      },
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price'],
    },
    certifications: [
      {
        type: String,
      },
    ],
    harvestDate: Date,
    storageConditions: String,
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['available', 'sold', 'archived'],
      default: 'available',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('FarmProduct', farmProductSchema)
