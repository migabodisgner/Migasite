const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: String,
    userEmail: String,

    productName: String,
    price: Number,
    quantity: {
        type: Number,
        default: 1
    },

    status: {
        type: String,
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Cart", cartSchema);
