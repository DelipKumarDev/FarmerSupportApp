import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProduceListing',
        },
        quantity: {
          amount: Number,
          unit: String,
        },
        pricePerUnit: Number,
        totalPrice: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    trackingId: String,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
