const express = require("express");
const Ride = require("../models/Ride");
const User = require("../models/user");

const router = express.Router();

router.get("/rides", async function(req, res) {
    try {
        const rides = await Ride.find({
            status: "pending"
        });
        res.send(rides);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/rides/:rideId/accept", async function(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);
        if (!ride) {
            return res.status(404).send({
                message: "Ride not found"
            });
        }
        if (ride.status !== "pending") {
            return res.status(400).send({
                message: "Ride is not available for acceptance"
            });
        }
        if (!req.body.driver) {
            return res.status(400).send({
                message: "Driver ID is required"
            });
        }
        const driver = await User.findById(req.body.driver);
        if (!driver) {
            return res.status(404).send({
                message: "Driver not found"
            });
        }
        if (driver.role !== "driver") {
            return res.status(403).send({
                message: "Only drivers can accept rides"
            });
        }
        ride.driver = req.body.driver;
        ride.status = "accepted";
        await ride.save();
        res.send(ride);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/rides/:rideId/complete", async function(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);
        if (!ride) {
            return res.status(404).send({
                message: "Ride not found"
            });
        }
        if (ride.status !== "accepted") {
            return res.status(400).send({
                message: "Ride is not accepted yet"
            });
        }
        if (!req.body.driver) {
            return res.status(400).send({
                message: "Driver ID is required"
            });
        }
        if (!ride.driver) {
            return res.status(400).send({
                message: "No driver assigned to this ride"
            });
        }
        if (ride.driver.toString() !== req.body.driver) {
            return res.status(403).send({
                message: "You cannot complete this ride"
            });
        }
        ride.status = "completed";
        await ride.save();
        res.send(ride);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/rides/:rideId/cancel", async function(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);
        if (!ride) {
            return res.status(404).send({
                message: "Ride not found"
            });
        }
        if (ride.status === "completed" || ride.status === "cancelled") {
            return res.status(400).send({
                message: "Ride cannot be cancelled"
            });
        }
        if (!req.body.passenger && !req.body.driver) {
            return res.status(400).send({
                message: "Passenger or driver ID is required"
            });
        }
        if (req.body.passenger) {
            if (ride.passenger.toString() !== req.body.passenger) {
                return res.status(403).send({
                    message: "You cannot cancel this ride"
                });
            }
        }
        if (req.body.driver) {
            if (!ride.driver) {
                return res.status(400).send({
                    message: "No driver assigned to this ride"
                });
            }
            if (ride.driver.toString() !== req.body.driver) {
                return res.status(403).send({
                    message: "You cannot cancel this ride"
                });
            }
        }
        ride.status = "cancelled";
        await ride.save();
        res.send(ride);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/drivers/:driverId/rides", async function(req, res) {
    try {
        const rides = await Ride.find({
            driver: req.params.driverId,
            status: "accepted"
        });
        res.send(rides);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/passengers/:passengerId/rides", async function(req, res) {
    try {
        const rides = await Ride.find({
            passenger: req.params.passengerId
        });
        res.send(rides);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/rides/:rideId", async function(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);
        if (!ride) {
            return res.status(404).send({
                message: "Ride not found"
            });
        }
        res.send(ride);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/drivers/:driverId/rides/completed", async function(req, res) {
    try {
        const rides = await Ride.find({
            driver: req.params.driverId,
            status: "completed"
        });
        if (rides.length === 0) {
            return res.status(404).send({
                message: "No completed rides found"
            });
        }
        res.send(rides);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;