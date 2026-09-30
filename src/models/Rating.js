const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({

    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        required: true
    },

    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    review: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;