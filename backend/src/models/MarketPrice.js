import mongoose from 'mongoose'

const marketPriceSchema = new mongoose.Schema(
  {
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    market: {
      name: {
        type: String,
        required: true,
      },
      city: String,
      state: String,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    avgPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      amount: Number,
      unit: {
        type: String,
        enum: ['kg', 'quintals', 'tons'],
        default: 'quintal',
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: 'AGMARKNET',
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('MarketPrice', marketPriceSchema)
