const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referralLink: {
        type: String,
        unique: true,
        required: true
    },
    commissionRate: {
        type: Number,
        required: true
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    commissionTransactions: [{
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;
