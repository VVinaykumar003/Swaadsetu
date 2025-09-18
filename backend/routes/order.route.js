const express = require("express");
const router = express.Router({ mergeParams: true });
const orderController = require("../controllers/order.controller");

// POST /api/:rid/orders
router.post("/", orderController.createOrder);

// PATCH /api/:rid/orders/:id/status
router.patch("/:id/status", orderController.updateOrderStatus);

// GET /api/:rid/orders/active
router.get("/active", orderController.getActiveOrders);

// GET /api/:rid/orders/history
router.get("/history", orderController.getOrderHistory);

module.exports = router;
