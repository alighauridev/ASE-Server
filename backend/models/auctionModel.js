const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    startPrice: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    bids: [
        {
            bidder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            time: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
