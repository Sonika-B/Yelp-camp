const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utilities/catchAsync")
const User = require("../models/user");
const users = require("../controllers/users");

router.get("/register" , (req , res ) =>{
    res.render("users/register");
});


router.post("/register" , catchAsync(users.register));

router.get("/login" , users.renderLogin)

router.post("/login" ,passport.authenticate("local" , {failureFlash:true , failureRedirect : "/login"}),users.login)

router.get("/logout" , users.logout);

module.exports=router;