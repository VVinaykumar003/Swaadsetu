const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin.controller");

// POST /api/:rid/admin/login
router.post("/login", adminController.login);

// GET /api/:rid/admin/menu (public)
router.get("/menu", adminController.getMenu);

// POST /api/:rid/admin/overrides
router.post("/overrides", adminController.generateOverrideToken);

// POST /api/:rid/admin/menu
router.post("/menu", adminController.updateMenu);

// GET /api/:rid/admin/analytics
router.get("/analytics", adminController.getAnalytics);

// POST /api/:rid/admin/export
router.post("/export", adminController.exportReport);

// PATCH /api/:rid/admin/tables/:id
router.patch("/tables/:id", adminController.updateTable);

// PATCH /api/:rid/admin/pin
router.patch("/pin", adminController.updatePin);

// PATCH /api/:rid/admin/staff-aliases
router.patch("/staff-aliases", adminController.updateStaffAliases);

module.exports = router;
