// models/vendorModel.js
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    wallet: {
        balance: {
            type: Number,
            default: 0,
        },
        withdrawals: [
            {
                amount: Number,
                status: {
                    type: String,
                    enum: ["pending", "approved", "rejected"],
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },

    companyName: {
        type: String,
        required: [true, "Please enter your company name"],
        maxLength: [100, "Your company name cannot exceed 100 characters"],
    },
    address: {
        street: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        state: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        country: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        zip: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 10,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Encrypting password before saving vendor
vendorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
vendorSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT token
vendorSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = mongoose.model("Vendor", vendorSchema);
