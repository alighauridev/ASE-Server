const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please enter product description"],
    },

    price: {
        type: Number,
        required: [true, "Please enter product price"],
    },
    cuttedPrice: {
        type: Number,
        required: [true, "Please enter cutted price"],
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannot exceed limit"],
        default: 1,
    },

    auction: {
        isAuction: Boolean,
        startTime: Date,
        endTime: Date,
        startingBid: Number,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    classifiedAd: {
        isClassifiedAd: Boolean,
        promotionDuration: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Product", productSchema);
