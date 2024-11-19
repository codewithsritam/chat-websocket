const User = require("../model/login.model");
const express = require("express");
const router = express.Router();

router.post("/", async(req, res) => {
    const findUser = await User.findOne({ phone: req.body.phone });
    if(findUser) {
        res.status(400).send("User already exists");
    }
    const user = new User(req.body);
    await user.save();

    res.status(200).send("Login successfully");
});

module.exports = router;