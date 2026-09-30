const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// POST /auth/login
router.post("/login", async function(req, res) {
    try {

        const { email, password } = req.body;

        if (
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.log("JWT_SECRET is missing in .env");
            return res.status(500).send({
                success: false,
                message: "Server configuration error"
            });
        }

        // password is hidden by default in the User model,
        // so we ask for it explicitly here
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        // Same message for "no user" and "wrong password"
        // so nobody can find out which emails are registered
        if (!user || !user.password) {
            return res.status(401).send({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).send({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.send({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
