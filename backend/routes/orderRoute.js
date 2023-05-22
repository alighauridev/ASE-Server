const express = require('express');
const { newOrder, getSingleOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const vendorOrderController = require("../controllers/orderController")

const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrderDetails);
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

//Vendor Order Routes 

router.get("/vendor/orders", vendorOrderController.getVendorOrders);
router.get("/vendor/order/status/:status", vendorOrderController.getVendorOrdersByStatus);
router.post("/vendor/order/daterange", vendorOrderController.getVendorOrdersByDateRange);
router.get("/vendor/order/product/:productId", vendorOrderController.getVendorOrdersByProduct);
router.get("/vendor/order/user/:userId", vendorOrderController.getVendorOrdersByUser);
router.get("/vendor/orders/totals", vendorOrderController.getVendorOrderTotals);
router.put("/vendor/order/markpaid/:orderId", vendorOrderController.markOrderAsPaid);
router.put("/vendor/order/refund/:orderId", vendorOrderController.applyRefundForOrder);
router.put("/vendor/order/notes/:orderId", vendorOrderController.updateVendorOrderNotes);
router.put("/vendor/order/shipping/:orderId", vendorOrderController.updateOrderShippingDetails);
router.put("/vendor/order/tracking/:orderId", vendorOrderController.updateOrderTrackingInfo);
router.put("/vendor/order/confirm/:orderId", vendorOrderController.confirmOrderDelivery);
router.get("/vendor/order/report", vendorOrderController.generateVendorOrderReport);
router.get("/vendor/order/export", vendorOrderController.exportVendorOrders);


module.exports = router;