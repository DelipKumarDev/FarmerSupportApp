import mongoose from 'mongoose'

const cropGuideSchema = new mongoose.Schema(
  {
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide guide title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide guide content'],
    },
    stage: {
      type: String,
      enum: ['preparation', 'sowing', 'growing', 'harvesting'],
      required: true,
    },
    tips: [
      {
        type: String,
      },
    ],
    warnings: [
      {
        type: String,
      },
    ],
    fertilizer: {
      name: String,
      quantity: String,
      time: String,
    },
    irrigation: {
      frequency: String,
      quantity: String,
    },
    image: {
      type: String,
      default: null,
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

export default mongoose.model('CropGuide', cropGuideSchema)
