const ServiceBooking = require('../models/ServiceBooking');

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await ServiceBooking.find().populate('service', 'name price').sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await ServiceBooking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
