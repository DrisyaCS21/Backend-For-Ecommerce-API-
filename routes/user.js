const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");

const {
    registerUser,
    loginUser,
    getUserDetails,
    updatePassword,
    setUserAsAdmin
} = require('../controllers/user');

// Register User
router.post("/register", userController.registerUser);

// Login User
router.post("/login", userController.loginUser);

// Get User Details (Authenticated users)
router.get("/details", verify, userController.getDetails);

// Update User Password (Authenticated users)
router.patch("/update-password", verify, userController.updatePassword);

// Update User as Admin (Admin only)
router.patch("/:id/set-as-admin",verify, verifyAdmin, userController.setAsAdmin);

module.exports = router;