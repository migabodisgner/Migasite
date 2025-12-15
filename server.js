const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/User");
const session = require("express-session"); // REQUIRED

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// REQUIRED for login → dashboard connection
app.use(
    session({
        secret: "secretkey",
        resave: false,
        saveUninitialized: true
    })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/loginSystem")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// -----------------------
// ROUTES
// -----------------------

// Login Page
app.get("/", (req, res) => {
    res.render("login");
});

// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});

// Home Page
app.get("/home", (req, res) => {
    res.render("home");
});

// Register - Save User
app.post("/register", async (req, res) => {
    const { fullname, email, password, role } = req.body;

    try {
        await User.create({ fullname, email, password, role });
        res.send("<h2>Account Created! <a href='/'>Login</a></h2>");
    } catch (err) {
        res.send("<h2>Email Already Exists! <a href='/register'>Try Again</a></h2>");
    }
});

// LOGIN - CHECK ROLE
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email, password: password });

    if (!user) {
        return res.send("<h2>Wrong Email or Password <a href='/'>Try Again</a></h2>");
    }

    if (user.role === "admin") {

        // REQUIRED: store admin info for dashboard
        req.session.admin = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };

        return res.redirect("/dashboard");
    }

    if (user.role === "user") {
        return res.sendFile(path.join(__dirname, "views", "home.html"));
    }
});

// Admin Dashboard Page (CONNECTED TO LOGIN)
app.get("/dashboard", async (req, res) => {

    // block access if not logged in
    if (!req.session.admin) {
        return res.redirect("/");
    }

    const admin = req.session.admin;
    const users = await User.find();
    const adminsCount = await User.countDocuments({ role: "admin" });

    res.render("dashboard", {
        admin,
        users,
        adminsCount
    });
});

// -----------------------
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
