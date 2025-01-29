require("dotenv").config();
const http = require("http");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3000;
const connectDB = require("./src/config/connect-with-mongodb");

// connect message model
const Message = require("./src/model/message.model");
const User = require("./src/model/login.model");

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
    console.log('A user connected:', socket.id);
    socketConnected.add(socket.id);

    // Emit total clients
    io.emit('total-clients', socketConnected.size);

    // 1. Handle login/signup
    socket.on('login', async ({ name, phone }, cb) => {
        try {
            let user = await User.findOne({ phone });

            if (user) {
                // Login existing user
                cb({ success: true, message: 'Login success', user });
            } else {
                // Create new user
                user = new User({ name, phone, dateTime: new Date().toLocaleString() });
                await user.save();
                cb({ success: true, message: 'Account created successfully', user });
            }
        } catch (error) {
            cb({ success: false, message: 'Error logging in', error });
        }
    });

    // 2. Show profile
    socket.on('getProfile', async ({ userId }, cb) => {
        try {
            const user = await User.findById(userId);

            if (!user) {
                return cb({ success: false, message: 'User not found' });
            }
            cb({ success: true, message: 'User found', user });
        } catch (error) {
            cb({ success: false, message: 'Error fetching user', error });
        }
    });

    // 3. Search user by phone number
    socket.on('searchUser', async (phone) => {
        try {
            const user = await User.findOne({ phone });
            if (!user) {
                return socket.emit('searchUser', { error: 'User not found' });
            }
            socket.emit('searchUser', user);
        } catch (error) {
            socket.emit('searchUser', error);
        }
    });

    // 4. Save and send messages
    socket.on('sendMessage', async ({ from, to, message, dateTime }, cb) => {
        try {
            const newMessage = new Message({ from, to, message, dateTime });
            await newMessage.save();
            
            socket.to(to).emit('newMessage', newMessage); // Notify the receiver in real time
            cb({ success: true, message: 'Message sent successfully', newMessage });
        } catch (error) {
            cb({ success: false, message: 'Error sending message', error });
        }
    });

    // 5. Show messages between two users
    socket.on('getMessages', async ({ from, to }, cb) => {
        try {
            const messages = await Message.find({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            }).sort({ dateTime: 1 });
            cb({ success: true, message: 'Messages found', messages });
        } catch (error) {
            cb({ success: false, message: 'Error fetching messages', error });
        }
    });

    // 6. Handle logout
    socket.on('logout', () => {
        console.log('User disconnected:', socket.id);
    });

    // Show old messages
    // try {
    //     const loadOldMessages = await Message.find({}).sort({ dateTime: 1 });
    //     socket.emit('loadOldMessages', loadOldMessages); // Use `socket.emit` to send to the connecting client only
    // } catch (error) {
    //     console.error('Error loading old messages:', error);
    // }

    // Typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data)
    });

    // Disconnect
    socket.on('disconnect', () => {
        socketConnected.delete(socket.id);
        io.emit('total-clients', socketConnected.size);
    });
}


app.use(express.static(path.join(__dirname, 'public')));

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});