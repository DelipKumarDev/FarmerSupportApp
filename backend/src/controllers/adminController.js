import { User, Discount, Order, ProduceListing } from '../models/index.js'

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1 } = req.query
    const limit = 10
    const skip = (page - 1) * limit

    let query = {}
    if (role) query.role = role
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.status(200).json({
      message: 'Users retrieved',
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user details
export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'User details retrieved',
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user (admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, isActive, phone, city, state } = req.body

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(state && { state }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'User updated',
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'User deactivated',
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const farmers = await User.countDocuments({ role: 'farmer' })
    const customers = await User.countDocuments({ role: 'customer' })
    const activeUsers = await User.countDocuments({ isActive: true })

    const totalOrders = await Order.countDocuments()
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })
    const pendingOrders = await Order.countDocuments({ status: 'pending' })

    const listings = await ProduceListing.countDocuments({ isActive: true })

    // Revenue calculation
    const orders = await Order.find({ status: 'delivered' })
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0)

    res.status(200).json({
      message: 'Dashboard statistics retrieved',
      stats: {
        users: {
          total: totalUsers,
          farmers,
          customers,
          active: activeUsers,
        },
        orders: {
          total: totalOrders,
          delivered: deliveredOrders,
          pending: pendingOrders,
          revenue: totalRevenue,
        },
        listings: listings,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
