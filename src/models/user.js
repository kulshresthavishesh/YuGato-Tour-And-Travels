const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,
    phone:String,
    email:String,
    password:{ type: String, select: false },
    role:String,
});
const User = mongoose.model('User', userSchema);
module.exports = User;