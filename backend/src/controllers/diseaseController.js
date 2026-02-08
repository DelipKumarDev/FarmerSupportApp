import { DiseaseResult } from '../models/index.js'
import fs from 'fs'
import path from 'path'

// Mock disease detection - in production, use actual ML API
const mockDiseaseDetection = (imagePath) => {
  const diseases = [
    {
      name: 'Powdery Mildew',
      confidence: 0.92,
      description: 'Fungal disease causing white powder on leaves',
      treatment: {
        organic: ['Neem oil spray', 'Baking soda solution', 'Sulfur dust'],
        chemical: ['Sulfur fungicide', 'Mancozeb'],
        preventive: ['Good air circulation', 'Proper spacing', 'Avoid overhead watering'],
      },
      severity: 'moderate',
    },
    {
      name: 'Leaf Rust',
      confidence: 0.85,
      description: 'Fungal disease with rust-colored lesions on leaves',
      treatment: {
        organic: ['Neem oil', 'Copper fungicide', 'Mustard oil spray'],
        chemical: ['Tebuconazole', 'Propiconazole'],
        preventive: ['Remove infected leaves', 'Improve drainage', 'Avoid watering at night'],
      },
      severity: 'moderate',
    },
    {
      name: 'Bacterial Leaf Scorch',
      confidence: 0.78,
      description: 'Bacterial infection causing sharp-lined lesions',
      treatment: {
        organic: ['Copper sulfate', 'Bordeaux mixture'],
        chemical: ['Streptomycin', 'Gentamicin'],
        preventive: ['Disinfect tools', 'Avoid overcrowding', 'Proper pruning'],
      },
      severity: 'severe',
    },
    {
      name: 'Healthy Leaf',
      confidence: 0.95,
      description: 'No disease detected',
      treatment: {
        organic: [],
        chemical: [],
        preventive: ['Continue regular monitoring', 'Maintain good hygiene', 'Proper nutrition'],
      },
      severity: 'mild',
    },
  ]

  return diseases[Math.floor(Math.random() * diseases.length)]
}

// Upload and detect disease
export const detectDisease = async (req, res) => {
  try {
    const { cropId } = req.body
    const userId = req.user.userId

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' })
    }

    if (!cropId) {
      return res.status(400).json({ message: 'Crop ID is required' })
    }

    // Save file info
    const imagePath = `/uploads/${req.file.filename}`

    // Mock disease detection
    const detection = mockDiseaseDetection(imagePath)

    // Save result to database
    const result = await DiseaseResult.create({
      userId,
      cropId,
      image: imagePath,
      detectedDisease: {
        name: detection.name,
        confidence: detection.confidence,
      },
      description: detection.description,
      treatment: detection.treatment,
      severity: detection.severity,
      recommendedAction: `Detected: ${detection.name}. Confidence: ${(detection.confidence * 100).toFixed(1)}%. Follow the recommended treatment plan below.`,
    })

    res.status(201).json({
      message: 'Disease detection completed',
      result: {
        id: result._id,
        disease: detection.name,
        confidence: (detection.confidence * 100).toFixed(1) + '%',
        description: detection.description,
        treatment: detection.treatment,
        severity: detection.severity,
        recommendation: result.recommendedAction,
        timestamp: result.timestamp,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get disease detection history
export const getDiseaseHistory = async (req, res) => {
  try {
    const userId = req.user.userId
    const { cropId } = req.query

    let query = { userId }
    if (cropId) query.cropId = cropId

    const results = await DiseaseResult.find(query)
      .populate('cropId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Disease history retrieved',
      count: results.length,
      results,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single disease result
export const getDiseaseResult = async (req, res) => {
  try {
    const { id } = req.params
    const result = await DiseaseResult.findById(id).populate('cropId userId')

    if (!result) {
      return res.status(404).json({ message: 'Result not found' })
    }

    // Check authorization
    if (result.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.status(200).json({
      message: 'Disease result retrieved',
      result,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
