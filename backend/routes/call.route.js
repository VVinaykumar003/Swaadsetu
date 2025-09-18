const express = require("express");
const router = express.Router({ mergeParams: true });
const callController = require("../controllers/call.controller");

// POST /api/:rid/calls
router.post("/", callController.createCall);

// PATCH /api/:rid/calls/:id/resolve
router.patch("/:id/resolve", callController.resolveCall);

// GET /api/:rid/calls/active
router.get("/active", callController.getActiveCalls);

module.exports = router;
