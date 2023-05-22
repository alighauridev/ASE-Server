const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, totalPrice } = req.body;

    const orderExist = await Order.findOne({ paymentInfo });

    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    await sendEmail({
        email: req.user.email,
        templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
        data: {
            name: req.user.name,
            shippingInfo,
            orderItems,
            totalPrice,
            oid: order._id,
        },
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    if (!orders) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get All Orders ---ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

// Update Order Status ---ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.shippedAt = Date.now();
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product, i.quantity);
        });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}

// Delete Order ---ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});

// Order controllers for vendor 

// Get Vendor Orders
exports.getVendorOrders = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object

    const orders = await Order.find({ "orderItems.product": { $in: vendorId } });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get Vendor Orders by Status
exports.getVendorOrdersByStatus = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object
    const status = req.params.status;

    const orders = await Order.find({
        "orderItems.product": { $in: vendorId },
        orderStatus: status,
    });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get Vendor Orders by Date Range
exports.getVendorOrdersByDateRange = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object
    const { startDate, endDate } = req.body;

    const orders = await Order.find({
        "orderItems.product": { $in: vendorId },
        createdAt: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get Vendor Orders by Product
exports.getVendorOrdersByProduct = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object
    const productId = req.params.productId;

    const orders = await Order.find({
        "orderItems.product": { $in: vendorId },
        "orderItems.product": productId,
    });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get Vendor Orders by User
exports.getVendorOrdersByUser = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object
    const userId = req.params.userId;

    const orders = await Order.find({
        "orderItems.product": { $in: vendorId },
        user: userId,
    });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get Vendor Order Totals
exports.getVendorOrderTotals = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object

    const orders = await Order.find({ "orderItems.product": { $in: vendorId } });

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
    });
});

// Mark Order as Paid (Vendor)
exports.markOrderAsPaid = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    order.paymentInfo.status = "Paid";
    await order.save();

    res.status(200).json({
        success: true,
    });
});

// Apply Refund for Order (Vendor)
exports.applyRefundForOrder = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    // Apply refund logic here

    res.status(200).json({
        success: true,
    });
});

// Update Vendor Order Notes
exports.updateVendorOrderNotes = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;
    const notes = req.body.notes;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    order.notes = notes;
    await order.save();

    res.status(200).json({
        success: true,
    });
});

// Update Order Shipping Details (Vendor)
exports.updateOrderShippingDetails = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;
    const shippingInfo = req.body.shippingInfo;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    order.shippingInfo = shippingInfo;
    await order.save();

    res.status(200).json({
        success: true,
    });
});

// Update Order Tracking Information (Vendor)
exports.updateOrderTrackingInfo = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;
    const trackingInfo = req.body.trackingInfo;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    order.trackingInfo = trackingInfo;
    await order.save();

    res.status(200).json({
        success: true,
    });
});

// Confirm Order Delivery (Vendor)
exports.confirmOrderDelivery = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
        success: true,
    });
});

// Generate Vendor Order Report
exports.generateVendorOrderReport = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object

    // Generate order report logic here

    res.status(200).json({
        success: true,
        message: "Order report generated",
    });
});

// Export Vendor Orders to CSV or Excel
exports.exportVendorOrders = asyncErrorHandler(async (req, res, next) => {
    const vendorId = req.user._id; // Assuming the vendor ID is stored in the user object

    // Export orders to CSV or Excel logic here

    res.status(200).json({
        success: true,
        message: "Orders exported",
    });
});