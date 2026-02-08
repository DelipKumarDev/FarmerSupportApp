import mongoose from 'mongoose'

const diseaseResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    detectedDisease: {
      name: String,
      confidence: Number,
    },
    description: String,
    treatment: {
      organic: [String],
      chemical: [String],
      preventive: [String],
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate',
    },
    recommendedAction: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('DiseaseResult', diseaseResultSchema)
