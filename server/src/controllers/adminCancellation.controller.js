const CancellationRequest = require('../models/CancellationRequest');
const Order = require('../models/Order');

exports.getCancellationRequests = async (req, res, next) => {
  try {
    const requests = await CancellationRequest.find()
      .populate('user', 'name email mobile')
      .populate({
        path: 'order',
        select: 'orderNumber totalAmount createdAt status products',
        populate: {
          path: 'products.product',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.updateCancellationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const request = await CancellationRequest.findById(id).populate('order');
    if (!request) return res.status(404).json({ success: false, message: 'Cancellation request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been processed' });
    }

    request.status = status;
    request.comments = comments;
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();

    if (status === 'approved') {
      const order = await Order.findById(request.order._id);
      if (order && !['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
        order.status = 'CANCELLED';
        order.statusHistory.push({
          status: 'CANCELLED',
          changedAt: new Date(),
          changedBy: req.admin._id,
          reason: `Admin approved cancellation request: ${comments || 'No comment'}`
        });
        await order.save();
      }
    }

    await request.save();

    res.json({ success: true, data: request, message: `Cancellation request ${status}` });
  } catch (error) {
    next(error);
  }
};
