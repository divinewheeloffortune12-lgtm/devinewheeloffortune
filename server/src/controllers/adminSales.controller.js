const Order = require('../models/Order');

exports.exportSales = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      filter.paymentStatus = req.query.paymentStatus;
    }
    
    // Handle date filtering
    if (req.query.dateRange && req.query.dateRange !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (req.query.dateRange === 'today') {
        filter.createdAt = { $gte: startOfDay };
      } else if (req.query.dateRange === 'yesterday') {
        const yesterday = new Date(startOfDay);
        yesterday.setDate(yesterday.getDate() - 1);
        filter.createdAt = { $gte: yesterday, $lt: startOfDay };
      } else if (req.query.dateRange === 'last7days') {
        const last7 = new Date(startOfDay);
        last7.setDate(last7.getDate() - 7);
        filter.createdAt = { $gte: last7 };
      } else if (req.query.dateRange === 'last30days') {
        const last30 = new Date(startOfDay);
        last30.setDate(last30.getDate() - 30);
        filter.createdAt = { $gte: last30 };
      } else if (req.query.dateRange === 'thismonth') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filter.createdAt = { $gte: firstDayOfMonth };
      } else if (req.query.dateRange === 'custom' && req.query.fromDate && req.query.toDate) {
        filter.createdAt = { 
          $gte: new Date(req.query.fromDate), 
          $lte: new Date(req.query.toDate + 'T23:59:59.999Z') 
        };
      }
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email mobile')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 })
      .lean();

    const exceljs = require('exceljs');
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Sales');

    worksheet.columns = [
      { header: 'Order ID', key: '_id', width: 25 },
      { header: 'Order Number', key: 'orderNumber', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Customer Email', key: 'customerEmail', width: 30 },
      { header: 'Amount', key: 'totalAmount', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Order Status', key: 'status', width: 15 },
      { header: 'Products', key: 'products', width: 50 },
      { header: 'Date', key: 'createdAt', width: 25 }
    ];

    orders.forEach(order => {
      const productNames = order.products
        .map(p => `${p.product?.name || 'Unknown'} (x${p.quantity})`)
        .join(', ');

      worksheet.addRow({
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Guest',
        customerEmail: order.user?.email || 'N/A',
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        products: productNames,
        createdAt: new Date(order.createdAt).toISOString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'sales-export.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
