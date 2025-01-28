const User = require("../model/login.model");
const express = require("express");
const router = express.Router();

router.post("/", async(req, res) => {
    const user = await User.findOne({ phone: req.body.phone });
    if(user){
        res.status(200).send("Login successfully");
    }
    
    const newUser = new User(req.body);
    await newUser.save();

    res.status(200).send("Login successfully");
});

module.exports = router;