const express = require("express");
const router = express.Router({ mergeParams: true });
const billController = require("../controllers/bill.controller");

// POST /api/:rid/bills
router.post("/", billController.createBill);

// PATCH /api/:rid/bills/:id/pay
router.patch("/:id/pay", billController.updatePaymentStatus);

// GET /api/:rid/bills/active
router.get("/active", billController.getActiveBills);

// GET /api/:rid/bills/history
router.get("/history", billController.getBillsHistory);

module.exports = router;
