const User = require('../models/User');
const DeletedUser = require('../models/DeletedUser');

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1000;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Never return passwordHashes
    let users = await User.find(query)
      .select('-passwordHash -googleId')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    // Fetch deleted users so they show up in the Deleted Users tab
    const deletedUsers = await DeletedUser.find(query).sort({ deletedAt: -1 });
    const mappedDeletedUsers = deletedUsers.map(du => ({
      _id: du.originalId,
      name: du.name,
      email: du.email,
      mobile: du.mobile,
      role: du.role,
      authProvider: du.authProvider,
      status: 'deleted',
      createdAt: du.originalCreatedAt,
      deletedAt: du.deletedAt
    }));

    users = [...users, ...mappedDeletedUsers];

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'blocked', 'blocked_24h', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = {};
    const unsetData = {};

    if (status === 'blocked_24h') {
      updateData.status = 'blocked';
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      updateData.blockedUntil = tomorrow;
    } else {
      updateData.status = status;
      unsetData.blockedUntil = 1;
    }

    const updateQuery = { $set: updateData };
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true }
    ).select('-passwordHash -googleId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    const userToDel = await User.findById(id);
    if (!userToDel) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Save to DeletedUser collection before hard delete
    await DeletedUser.create({
      originalId: userToDel._id,
      name: userToDel.name,
      email: userToDel.email,
      mobile: userToDel.mobile,
      role: userToDel.role,
      authProvider: userToDel.authProvider,
      originalCreatedAt: userToDel.createdAt
    });

    // Bypass mongoose middleware and directly delete from collection to avoid 500 errors
    const result = await User.collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User permanently deleted successfully' });
  } catch (error) {
    console.error('CRITICAL Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error during deletion: ' + error.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const exceljs = require('exceljs');
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Joined At', key: 'createdAt', width: 20 }
    ];

    const users = await User.find({}).select('-passwordHash -googleId').sort({ createdAt: -1 });

    users.forEach(user => {
      worksheet.addRow({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile || 'N/A',
        status: user.status,
        createdAt: user.createdAt.toISOString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users-export.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
