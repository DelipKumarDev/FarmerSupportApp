import { Order, ProduceListing } from '../models/index.js'

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      farmerId,
      shippingAddress,
      paymentMethod,
      discountCode,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have items' })
    }

    // Calculate total and update items with pricing
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const listing = await ProduceListing.findById(item.productId)
      if (!listing) {
        return res.status(404).json({ message: `Listing ${item.productId} not found` })
      }

      const itemTotal = listing.price * item.quantity.amount
      totalAmount += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: listing.price,
        totalPrice: itemTotal,
      })
    }

    // Apply discount if provided
    let discountAmount = 0
    if (discountCode) {
      // Discount logic can be added here
      discountAmount = 0
    }

    const finalAmount = totalAmount - discountAmount

    const order = await Order.create({
      orderId: generateOrderId(),
      customerId: req.user.userId,
      farmerId,
      items: orderItems,
      totalAmount,
      discountAmount,
      finalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
    })

    res.status(201).json({
      message: 'Order created successfully',
      order,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get customer's orders
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.userId
    const orders = await Order.find({ customerId })
      .populate('farmerId', 'name phone')
      .populate('items.productId')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Orders retrieved',
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get farmer's orders
export const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.userId
    const orders = await Order.find({ farmerId })
      .populate('customerId', 'name phone email')
      .populate('items.productId')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Orders retrieved',
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get order details
export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params
    const order = await Order.findById(id)
      .populate('customerId')
      .populate('farmerId')
      .populate('items.productId')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check authorization
    if (
      order.customerId._id.toString() !== req.user.userId &&
      order.farmerId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.status(200).json({
      message: 'Order details retrieved',
      order,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Only farmer or admin can update
    if (order.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    order.status = status
    order.updatedAt = new Date()
    await order.save()

    res.status(200).json({
      message: 'Order status updated',
      order,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
