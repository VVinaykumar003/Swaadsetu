const express = require("express");
const router = express.Router({ mergeParams: true });
const tableController = require("../controllers/table.controller");
const authMiddleware = require("../common/middlewares/auth.middleware");

// POST /api/:rid/tables - Create new table (Admin only)
router.post("/", authMiddleware, tableController.createTable);

// GET /api/:rid/tables
router.get("/", tableController.getTables);

// GET /api/:rid/tables/:id
router.get("/:id", tableController.getTableById);

// PATCH /api/:rid/tables/:id/status
router.patch("/:id/status", tableController.updateTableStatus);

// PATCH /api/:rid/tables/:id/session
router.patch("/:id/session", tableController.assignSession);

// PATCH /api/:rid/tables/:id/staff
router.patch("/:id/staff", tableController.updateStaffAlias);

// DELETE /api/:rid/tables/:id - Delete table (Admin only)
router.delete("/:id", authMiddleware, tableController.deleteTable);

module.exports = router;
