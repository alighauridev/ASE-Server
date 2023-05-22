const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

module.exports = Withdrawal;
