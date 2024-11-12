require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => { console.log(`Server running this port: http://localhost:${PORT}`); });
const io = require("socket.io")(server, {
    cors: {
      origin: "*", // Update this to your domain in production
      methods: ["GET", "POST"]
    }
});
  

app.use(express.static(path.join(__dirname, 'public')));

let streamConnected = new Set();
io.on('connection', onConnected);

function onConnected(stream) {
    // console.log('Stream connect :', stream.id);
    streamConnected.add(stream.id);

    io.emit('total-clients', streamConnected.size);

    stream.on('disconnect', () => {
        // console.log('Stream disconnect :', stream.id);
        streamConnected.delete(stream.id);
        io.emit('total-clients', streamConnected.size);
    })

    stream.on('message', (data) => {
        // console.log(data);
        stream.broadcast.emit('chat-message', data)
    })

    stream.on('typing', (data) => {
        // console.log(data);
        stream.broadcast.emit('typing', data)
    })
}