const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Render login
router.get("/", (req, res) => {
    res.render("login");
});

// Render register
router.get("/register", (req, res) => {
    res.render("register");
});

// Handle Registration
router.post("/register", async (req, res) => {
    const { fullname, email, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.send("Email already exists!");

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ fullname, email, password: hashed, role });

    res.redirect("/");
});

// Handle Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found!");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Incorrect password!");

    // 🔑 SESSION (ibura)
    if (user.role === "admin") {
        req.session.admin = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };
        return res.redirect("/dashboard");
    }

    if (user.role === "user") {
        req.session.user = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };
        return res.redirect("/home");
    }
});

module.exports = router;
