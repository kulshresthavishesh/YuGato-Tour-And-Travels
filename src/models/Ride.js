const mongoose = require("mongoose");
const rideSchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pickup: {
        address: String,
        latitude: Number,
        longitude: Number
    },
    drop: {
        address: String,
        latitude: Number,
        longitude: Number
    },
    distance: Number,
    estimatedTime: Number,
    suggestedFare: Number,
    offeredFare: Number,
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "completed", "cancelled"],
        default: "pending"
    }
});
const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;