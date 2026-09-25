const express = require('express');
const app = express();
const User = require('./models/user');
const Ride = require('./models/Ride');
app.use(express.json());


// User Se Uska Data Lene Ke liye Post API

app.post('/user', async function(req, res) {

    const existingUser = await User.findOne({
        email: req.body.email
    });
    if (existingUser) {
        return res.status(400).send("Email already registered");
    }
    const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    });
    await user.save();
    res.send(user);
});

// Ride Se Uska Data Lene Ke liye Post API

app.post('/ride', async function(req, res) {
    const ride = new Ride({
        passenger: req.body.passenger,
        pickup: {
            address: req.body.pickup.address,
            latitude: req.body.pickup.latitude,
            longitude: req.body.pickup.longitude
        },
        drop: {
            address: req.body.drop.address,
            latitude: req.body.drop.latitude,
            longitude: req.body.drop.longitude
        },
        offeredFare: req.body.offeredFare
    });
    await ride.save();
    res.status(201).send(ride);
});


``
































app.get('/', function(req,res){
    res.send("Hello World")
})

module.exports = app;

