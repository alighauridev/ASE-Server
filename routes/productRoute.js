const express = require("express");
const {
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getProductReviews,
    deleteReview,
    createProductReview,
    createProduct,
    getAdminProducts,
    getProducts,
    searchProducts,
    createProductByVendor,
    deleteProductByVendor,
    updateProductByVendor,
    getProductsByCategory,
    approveProduct,
    getApprovedProducts,
} = require("../controllers/productController");
const {
    isAuthenticatedUser,
    authorizeRoles,
    isAuthenticatedVendor,
} = require("../middlewares/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/vendor/product/:id").delete(deleteProduct);
router.route("/products/all").get(getApprovedProducts);
router.route("/admin/products/all").get(getProducts);
router.patch("/admin/products/:productId/approve", approveProduct);
router.get("/search", searchProducts);
router
    .route("/admin/products")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);
router
    .route("/admin/product/new")
    .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router
    .route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
    .route("/admin/reviews")
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);
router.route("/product").post(isAuthenticatedVendor, createProductByVendor);
router
    .route("/product/:id")
    .put(isAuthenticatedVendor, updateProductByVendor)
    .delete(isAuthenticatedVendor, deleteProductByVendor);
router.get("/products/category/:categoryId", getProductsByCategory);

module.exports = router;
