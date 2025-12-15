const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/User");
const session = require("express-session");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup
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

// Home Page (USER)
app.get("/home", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.render("home", { user: req.session.user });
});

// Cart Page (USER)
app.get("/cart", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.render("cart", { user: req.session.user });
});

// Logout (USER & ADMIN)
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send("Error while logging out");
        }
        res.redirect("/");
    });
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

    // ADMIN
    if (user.role === "admin") {
        req.session.admin = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };
        return res.redirect("/dashboard");
    }

    // USER
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

// Admin Dashboard Page (corrected)
app.get("/dashboard", async (req, res) => {
    if (!req.session.admin) {
        return res.redirect("/");
    }

    const admin = req.session.admin;
    const users = await User.find();
    const adminsCount = await User.countDocuments({ role: "admin" }); // fixed

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
