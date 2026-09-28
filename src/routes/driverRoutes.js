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

router.post("/rides/:rideId/complete",async function(req,res){
    const ride = await Ride.findById(req.params.rideId);    
    if(!ride){
        return res.status(404).send({
            message:"Ride not found"
        })
    }
    if(ride.status !== "accepted"){
        return res.status(400).send({
            message:"Ride is not accepted yet"
        })
    }
    ride.status = "completed";
    await ride.save();
    res.send(ride);
})

router.post("/rides/:rideId/cancel",async function(req,res){
    const ride = await Ride.findById(req.params.rideId);    
    if(!ride){
        return res.status(404).send({
            message:"Ride not found"
        })
    }
    if(ride.status === "completed" || ride.status === "cancelled"){
        return res.status(400).send({
            message:"Ride cannot be cancelled"
        })
    }
    ride.status = "cancelled";
    await ride.save();
    res.send(ride);
})

//driver ke accepted rides ko dekhne ke liye API

router.get("/drivers/:driverId/rides", async function(req,res){
    try{
        const rides = await Ride.find({
            driver:req.params.driverId,
            status:"accepted"
        })
        res.send(rides);
    }
    catch(error){
        res.status(500).send(error.message);
    }
})

//Passenger → apni rides dekhna karenge:

router.get('/passengers/:passengerId/rides' , async function(req,res){
    const rides = await Ride.find({
        passenger:req.params.passengerId
    })
    res.send(rides);
})

//Ride details by ID.

router.get('/rides/:rideId' , async function(req,res){
    const ride = await Ride.findById(req.params.rideId);
    if(!ride){
        return res.status(404).send({
            message:"Ride not found"
        })
    }
    res.send(ride);
})

//completed rides by driver

router.get("/drivers/:driverId/rides/completed", async function(req,res){
    const rides = await Ride.find({
        driver:req.params.driverId,
        status:"completed"
    })
    if(rides.length === 0){
        return res.status(404).send({
            message:"No completed rides found"
        })
    }
    res.send(rides);
})


















module.exports = router;

