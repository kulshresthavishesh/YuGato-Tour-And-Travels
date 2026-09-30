const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

const User = require('./models/user');
const Ride = require('./models/Ride');
const driverRoutes = require('./routes/driverRoutes');
const authRoutes = require('./routes/authRoutes');
const Rating = require('./models/Rating');

app.use(express.json());

app.use("/driver", driverRoutes);
app.use("/auth", authRoutes);


// User Registration API

app.post('/user', async function(req, res) {

    try {

        if (
            typeof req.body.email !== "string" || !req.body.email.trim() ||
            typeof req.body.password !== "string" || req.body.password.length < 6
        ) {
            return res.status(400).send({
                message: "Valid email and a password of at least 6 characters are required"
            });
        }

        const email = req.body.email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(400).send("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: email,
            password: hashedPassword,
            role: req.body.role
        });

        await user.save();

        // never send the password back
        const { password, ...safeUser } = user.toObject();

        res.send(safeUser);

    } catch (error) {

        res.status(500).send(error.message);

    }

});


// Create Ride API

app.post('/ride', async function(req, res) {

    try {

        if (!req.body.passenger || !req.body.pickup || !req.body.drop) {
            return res.status(400).send({
                message: "Passenger, pickup and drop are required"
            });
        }

        if (
            typeof req.body.offeredFare !== "number" ||
            req.body.offeredFare <= 0
        ) {
            return res.status(400).send({
                message: "Valid offered fare is required"
            });
        }

        const passenger = await User.findById(req.body.passenger);
        if (!passenger) {
            return res.status(404).send({
                message: "Passenger not found"});
        }
        if (passenger.role !== "passenger") {
            return res.status(403).send({
                message: "Only passengers can create rides"
            });
        }

        const pickup = req.body.pickup;
        const drop = req.body.drop;

        if (
            typeof pickup.latitude !== "number" ||
            typeof pickup.longitude !== "number" ||
            typeof drop.latitude !== "number" ||
            typeof drop.longitude !== "number"
        ) {
            return res.status(400).send({
                message: "Valid pickup and drop coordinates are required"
            });
        }

        if (
            pickup.latitude < -90 ||
            pickup.latitude > 90 ||
            drop.latitude < -90 ||
            drop.latitude > 90
        ) {
            return res.status(400).send({
                message: "Invalid latitude"
            });
        }

        if (
            pickup.longitude < -180 ||
            pickup.longitude > 180 ||
            drop.longitude < -180 ||
            drop.longitude > 180
        ) {
            return res.status(400).send({
                message: "Invalid longitude"
            });
        }

        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${pickup.longitude},${pickup.latitude};` +
            `${drop.longitude},${drop.latitude}?overview=false`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || !data.routes.length) {
            return res.status(400).send({
                message: "Route not found"
            });
        }

        const distance = data.routes[0].distance / 1000;
        const estimatedTime = data.routes[0].duration / 60;

        const suggestedFare =
            40 +
            (distance * 15) +
            (estimatedTime * 2);

        const ride = new Ride({

            passenger: req.body.passenger,

            pickup: {
                address: pickup.address,
                latitude: pickup.latitude,
                longitude: pickup.longitude
            },

            drop: {
                address: drop.address,
                latitude: drop.latitude,
                longitude: drop.longitude
            },

            distance: Number(distance.toFixed(2)),
            estimatedTime: Number(estimatedTime.toFixed(2)),
            suggestedFare: Math.round(suggestedFare),

            offeredFare: req.body.offeredFare
        });

        await ride.save();

        res.status(201).send(ride);

    } catch (error) {

        res.status(500).send(error.message);

    }

});

app.post('/rating', async function(req, res) {

    try {

        const { ride, passenger, rating, review } = req.body;

        if (!ride || !passenger || rating === undefined) {
            return res.status(400).send({
                message: "Ride, passenger and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).send({
                message: "Rating must be between 1 and 5"
            });
        }

        const rideData = await Ride.findById(ride);

        if (!rideData) {
            return res.status(404).send({
                message: "Ride not found"
            });
        }

        if (rideData.status !== "completed") {
            return res.status(400).send({
                message: "Only completed rides can be rated"
            });
        }

        if (rideData.passenger.toString() !== passenger) {
            return res.status(403).send({
                message: "You cannot rate this ride"
            });
        }

        const existingRating = await Rating.findOne({
            ride: ride
        });

        if (existingRating) {
            return res.status(400).send({
                message: "Ride already rated"
            });
        }

        const newRating = new Rating({

            ride: ride,

            passenger: passenger,

            driver: rideData.driver,

            rating: rating,

            review: review

        });

        await newRating.save();

        res.status(201).send(newRating);

    } catch (error) {

        res.status(500).send(error.message);

    }

});

//Driver Rating/Review dekh sake — GET API banayenge.

app.get('/driver/:driverId/ratings', async function(req, res) {
    try {
        const ratings = await Rating.find({
            driver: req.params.driverId
        });
        res.send(ratings);
    } catch (error) {
        res.status(500).send(error.message);
    }
});











// Home API

app.get('/', function(req, res) {
    res.send("Hello World");
});


module.exports = app;