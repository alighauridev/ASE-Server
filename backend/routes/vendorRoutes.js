const express = require("express");
const router = express.Router();
const {
    registerVendor,
    loginVendor,
    getVendorDetails,
    updateVendorProfile,
    updateVendorPassword,
    uploadProduct,
    updateProduct,
    deleteProduct,
    requestWithdrawal,
    getVendorProducts,
} = require("../controllers/vendorControllers");
// const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.get('/:vendorId/products', getVendorProducts);

router.get("/details", getVendorDetails);
router.put("/profile/update", updateVendorProfile);
router.put("/password/update", updateVendorPassword);
router.post("/product/upload", uploadProduct);
router.put("/product/:id/update", updateProduct);
router.delete("/product/:id/delete", deleteProduct);
router.post("/withdrawal/request", requestWithdrawal);
router.get("/products", getVendorProducts);

module.exports = router;
