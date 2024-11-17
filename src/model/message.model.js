const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    name: String,
    message: String,
    dateTime: String,
});

module.exports = mongoose.model("Message", messageSchema);