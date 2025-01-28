const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
    name: String,
    phone: {
        type: Number,
        unique: true,
        required: true
    },
});

module.exports = mongoose.model("Users", loginSchema);