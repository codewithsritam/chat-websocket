require("dotenv").config();
const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    path: '/api/socket.io'  // Adjust the path to work with Vercel functions
});

let socketConnected = new Set();
// socket.io
io.on('connection', onConnected);

function onConnected(socket) {
    socketConnected.add(socket.id);

    io.emit('total-clients', socketConnected.size);

    socket.on('message', (data) => {
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