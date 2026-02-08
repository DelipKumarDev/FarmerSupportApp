import mongoose from 'mongoose'

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide crop name'],
      trim: true,
      unique: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'summer', 'perennial'],
      required: true,
    },
    soilType: [
      {
        type: String,
      },
    ],
    temperature: {
      min: Number,
      max: Number,
    },
    rainfall: {
      min: Number,
      max: Number,
    },
    growthDays: Number,
    image: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Crop', cropSchema)
