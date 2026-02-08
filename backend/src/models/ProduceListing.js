import mongoose from 'mongoose'

const produceListingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmProduct',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide listing title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    minOrder: {
      amount: Number,
      unit: {
        type: String,
        enum: ['kg', 'quintals', 'tons', 'liters'],
      },
    },
    maxOrder: {
      amount: Number,
      unit: {
        type: String,
        enum: ['kg', 'quintals', 'tons', 'liters'],
      },
    },
    availableQuantity: {
      amount: Number,
      unit: {
        type: String,
        enum: ['kg', 'quintals', 'tons', 'liters'],
      },
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    listingType: {
      type: String,
      enum: ['direct', 'wholesale'],
      default: 'direct',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('ProduceListing', produceListingSchema)
