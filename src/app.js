const express = require('express');
const app = express();
const User = require('./models/user');
const Ride = require('./models/Ride');
const driverRoutes = require("./routes/driverRoutes");

app.use(express.json());

app.use("/driver", driverRoutes);


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

// Ride Se Uska Data Lene Ke liye Post API ( BY ME )

// app.post('/ride', async function(req, res) {
//     try {
//         const pickup = req.body.pickup;
//         const drop = req.body.drop;
//         const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${drop.longitude},${drop.latitude}?overview=false`
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.code !== "Ok" || !data.routes.length) {
//             return res.status(400).send("Route not found");
//         }
//         const distance = data.routes[0].distance / 1000;
//         const estimatedTime = data.routes[0].duration / 60;
//         const ride = new Ride({
//             passenger: req.body.passenger,
//             pickup: {
//                 address: pickup.address,
//                 latitude: pickup.latitude,
//                 longitude: pickup.longitude
//             },
//             drop: {
//                 address: drop.address,
//                 latitude: drop.latitude,
//                 longitude: drop.longitude
//             },
//             distance: Number(distance.toFixed(2)),
//             estimatedTime: Number(estimatedTime.toFixed(2)),
//             offeredFare: req.body.offeredFare
//         });
//         await ride.save();
//         res.status(201).send(ride);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// Updated Ride Post API By AI

app.post('/ride', async function(req, res) {
    try {
        const pickup = req.body.pickup;
        const drop = req.body.drop;

        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${drop.longitude},${drop.latitude}?overview=false`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes.length) {
            return res.status(400).send("Route not found");
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
































app.get('/', function(req,res){
    res.send("Hello World")
})

module.exports = app;

