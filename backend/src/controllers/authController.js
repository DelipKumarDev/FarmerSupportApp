import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'
import { comparePasswords } from '../utils/password.js'

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, state } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      city,
      state,
    })

    // Generate token
    const token = generateToken(user._id, user.role)

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      })
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' })
    }

    // Generate token
    const token = generateToken(user._id, user.role)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        state: user.state,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({
      message: 'Profile fetched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        farmSize: user.farmSize,
        farmLocation: user.farmLocation,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, farmSize } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pincode && { pincode }),
        ...(farmSize !== undefined && { farmSize }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        farmSize: user.farmSize,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current and new password',
      })
    }

    const user = await User.findById(req.user.userId).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.password
    )
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    return res.status(200).json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Logout (optional - mainly for token cleanup on frontend)
export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Logged out successfully',
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
