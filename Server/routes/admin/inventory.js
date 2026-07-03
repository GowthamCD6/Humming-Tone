const express = require("express");
const router = express.Router();
const inventoryController = require("../../controllers/admin/inventory");

router.get("/admin/fetch_inventory", inventoryController.fetch_inventory);
router.patch("/admin/update_inventory/:id", inventoryController.update_inventory);
router.patch("/admin/update_inventory_full/:id", inventoryController.update_inventory_full);

module.exports = router;
