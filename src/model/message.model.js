const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    message: String,
    dateTime: String
});

module.exports = mongoose.model("Message", messageSchema);