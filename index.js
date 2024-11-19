require("dotenv").config();
const http = require("http");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3001;
const connectDB = require("./src/config/connect-with-mongodb");

// connect message model
const Message = require("./src/model/message.model");

// Login Routes
const LoginRoutes = require("./src/routes/login.routes");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware for parsing JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Call mongodb connection
connectDB();

// Call login routes
app.use("/login", LoginRoutes);


// socket.io
let socketConnected = new Set(); // To Track connected socket
io.on('connection', onConnected);

async function onConnected(socket) {
    console.log("user connected :", socket.id);
    socketConnected.add(socket.id);

    io.emit('total-clients', socketConnected.size);

    // Show old messages
    try {
        const loadOldMessages = await Message.find({}).sort({ dateTime: 1 });
        socket.emit('loadOldMessages', loadOldMessages); // Use `socket.emit` to send to the connecting client only
    } catch (error) {
        console.error('Error loading old messages:', error);
    }

    socket.on('message', async (data) => {
        const { name, message, dateTime } = data;

        const newMessage = new Message({ name, message, dateTime });
        await newMessage.save();

        socket.broadcast.emit('chat-message', data)
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data)
    })

    socket.on('disconnect', () => {
        socketConnected.delete(socket.id);
        io.emit('total-clients', socketConnected.size);
    })
}


app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`Server running this port: http://localhost:${PORT}`);
});