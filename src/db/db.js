const mongoose = require('mongoose');

async function connectDB(){
    await mongoose.connect('');
    console.log('Connected to MongoDB');
}

module.exports = connectDB;