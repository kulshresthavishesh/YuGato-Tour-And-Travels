const express = require('express');
const app = express();
const User = require('./models/user');
app.use(express.json());


// User Se Uska Data Lene Ke liye Post API

app.post('/user', async function(req, res) {
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

































app.get('/', function(req,res){
    res.send("Hello World")
})

module.exports = app;

