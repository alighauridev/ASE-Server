// middlewares/isVendor.js

const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');
const Vendor = require('../models/vendorModel');

exports.isVendor = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.vendor.id);

    if (!vendor || vendor.role !== 'vendor') {
        return next(new ErrorHandler('Access denied. You are not authorized to access this route.', 403));
    }

    next();
});
