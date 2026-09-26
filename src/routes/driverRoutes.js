const express = require("express");
const Ride = require("../models/Ride");

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

//Ride Accept Karne Le liye Post API

router.post("/rides/:rideId/accept", async function(req,res){
    const ride = await Ride.findById(req.params.rideId);
    if(!ride){
        return res.status(404).send({
            message:"Ride not found"
        })
    }
    if(ride.status !== "pending"){
        return res.status(404).send({
            message:"Ride is not avaliablr for acceptance"
        })
    }
    ride.driver = req.body.driver;
    ride.status = "accepted";
    await ride.save();
    res.send(ride);
})






















module.exports = router;

