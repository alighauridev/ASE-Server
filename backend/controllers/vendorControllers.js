const Vendor = require("../models/vendorModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Withdrawal = require("../models/withdrawalModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const cloudinary = require("cloudinary");

// Register vendor
exports.registerVendor = asyncErrorHandler(async (req, res, next) => {
    const { name, email, companyName, address, user } = req.body;
    const parsedAddress = JSON.parse(address);

    // Fetch the user by their ID.
    const foundUser = await User.findById(user);

    if (!foundUser) {
        // Handle the case where the user was not found.
        return next(new Error("User not found"));
    }

    // Change the user's role to 'vendor'.
    foundUser.role = "vendor";

    // Save the updated user.
    await foundUser.save();

    const vendor = await Vendor.create({
        name,
        email,
        companyName,
        address: parsedAddress,
        user,
    });

    sendToken(vendor, 200, res);
});



// Login Vendor
exports.loginVendor = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const vendor = await Vendor.findOne({ email }).select("+password");

    if (!vendor) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await vendor.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(vendor, 200, res);
});

// Get Vendor Details
exports.getVendorDetails = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.vendor.id)
        .populate("user")
        .populate("products");

    res.status(200).json({
        success: true,
        vendor,
    });
});

// Update Vendor Profile
exports.updateVendorProfile = asyncErrorHandler(async (req, res, next) => {
    const newVendorData = {
        name: req.body.name,
        email: req.body.email,
        companyName: req.body.companyName,
        address: req.body.address,
        user: req.body.user,
    };

    await Vendor.findByIdAndUpdate(req.vendor.id, newVendorData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Update Vendor Password
exports.updateVendorPassword = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.vendor.id).select("+password");

    const isPasswordMatched = await vendor.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is invalid", 400));
    }

    vendor.password = req.body.newPassword;
    await vendor.save();
    sendToken(vendor, 200, res);
});

exports.uploadProduct = asyncErrorHandler(async (req, res, next) => {
    try {
        const { name, description, price, cuttedPrice, category, stock, vendor } = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        const ven = await Vendor.findById(vendor);
        if (!ven) {
            return next(new ErrorHandler("Vendor not found", 404));
        }

        const product = await Product.create({
            name,
            description,
            price,
            cuttedPrice,
            image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
            category,
            stock,
            vendor: ven._id, // assign the id of the vendor from the database
        });

        ven.products.push(product._id); // push into ven.products instead of vendor.products
        await ven.save(); // save ven instead of vendor

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error(error);
        return next(new ErrorHandler("Product creation failed", 500));
    }
});


// Update product
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    const {
        name,
        description,
        price,
        cuttedPrice,
        category,
        stock,
        auction,
        classifiedAd,
    } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    if (product.vendor.toString() !== req.vendor.id) {
        return next(
            new ErrorHandler("You are not allowed to update this product", 403)
        );
    }

    const updatedProductData = {
        name,
        description,
        price,
        cuttedPrice,
        category,
        stock,
        auction,
        classifiedAd,
    };

    product = await Product.findByIdAndUpdate(req.params.id, updatedProductData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });

    await Product.create({
        name,
        description,
        price,
        cuttedPrice,
        images,
        category,
        stock,
        auction,
        classifiedAd,
        vendor: req.vendor.id,
    });

    //     scss
    // Copy code
    vendor.products.push(product._id);
    await vendor.save();

    res.status(201).json({
        success: true,
        product,
    });
});

// Update product
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    const {
        name,
        description,
        price,
        cuttedPrice,
        category,
        stock,
        auction,
        classifiedAd,
    } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    if (product.vendor.toString() !== req.vendor.id) {
        return next(
            new ErrorHandler("You are not allowed to update this product", 403)
        );
    }

    const updatedProductData = {
        name,
        description,
        price,
        cuttedPrice,
        category,
        stock,
        auction,
        classifiedAd,
    };

    product = await Product.findByIdAndUpdate(req.params.id, updatedProductData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// Delete product
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    const vendor = await Vendor.findById(req.vendor.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    if (product.vendor.toString() !== req.vendor.id) {
        return next(
            new ErrorHandler("You are not allowed to delete this product", 403)
        );
    }

    // Remove product from vendor's array of products
    const index = vendor.products.indexOf(product._id);

    if (index > -1) {
        vendor.products.splice(index, 1);
        await vendor.save();
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});

// Request withdrawal
exports.requestWithdrawal = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.vendor.id);
    if (!vendor) {
        return next(new ErrorHandler("Vendor not found", 404));
    }

    const { amount } = req.body;

    if (amount > vendor.wallet.balance) {
        return next(
            new ErrorHandler("Withdrawal amount exceeds available balance", 400)
        );
    }

    const withdrawal = await Withdrawal.create({
        vendor: req.vendor.id,
        amount,
    });

    vendor.wallet.withdrawals.push(withdrawal._id);
    await vendor.save();

    res.status(201).json({
        success: true,
        withdrawal,
    });
});
exports.getVendorProducts = asyncErrorHandler(async (req, res, next) => {
    // Get vendor id from request parameters
    const { vendorId } = req.params;
    // Query database for products with the matching vendor id
    const products = await Product.find({ vendor: vendorId });

    // Check if products were found
    if (products.length === 0) {
        return next(new ErrorHandler("No products found for this vendor", 404));
    }

    // Send products in response
    res.status(200).json({
        success: true,
        products
    });
});
