document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    socket.on('connect', () => {
        console.log(`Socket connected to the server..`);
    });

    const totalClients = document.getElementById("total-clients");
    const messageContainer = document.getElementById("message-container");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    const userName = document.getElementById("user-name");
    const userNumber = document.getElementById("user-number");

    // Get users from local storage
    const fromUser = JSON.parse(localStorage.getItem('from'));
    const toUser = JSON.parse(localStorage.getItem('to'));
    userName.innerText = toUser.name;
    userNumber.innerText = toUser.phone;

    const from = fromUser._id;
    const to = toUser._id;

    // **Join Room**
    socket.emit('joinRoom', { userId: from });

    // **Send Message**
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    function sendMessage() {
        if (messageInput.value === '') return;

        const message = messageInput.value;
        const dateTime = new Date().toLocaleString();

        socket.emit('sendMessage', { from, to, message, dateTime }, (response) => {
            if (response.success) {
                addMessageToUI(true, response.newMessage);
            }
        });

        messageInput.value = '';
    }

    // **Load Old Messages**
    socket.emit('getMessages', { from, to }, (response) => {
        if (response.success) {
            response.newMessage.forEach((message) => {
                addMessageToUI(false, message);
            });
        }
    });

    // **Listen for New Messages**
    socket.on('newMessage', (data) => {
        addMessageToUI(false, data);
    });

    function addMessageToUI(isOwnMessage, data) {
        clearTyping();
        const element = `<li class="${isOwnMessage ? 'message-right' : 'message-left'}">
                <p>${data.message}</p>
                <span>${isOwnMessage ? 'You' : toUser.name} • ${data.dateTime}</span>
            </li>`;
        messageContainer.innerHTML += element;
        scrollToBottom();
    }

    // **Typing Indicator**
    messageInput.addEventListener('focus', () => {
        socket.emit('typing', { typing: `${fromUser.name} is typing...` });
    });

    messageInput.addEventListener('keypress', () => {
        socket.emit('typing', { typing: `${fromUser.name} is typing...` });
    });

    messageInput.addEventListener('blur', () => {
        socket.emit('typing', { typing: '' });
    });

    socket.on('typing', (data) => {
        clearTyping();
        if (data.typing) {
            const element = `<li class="message-typing"><p>${data.typing}</p></li>`;
            messageContainer.innerHTML += element;
            scrollToBottom();
        }
    });

    function clearTyping() {
        document.querySelectorAll('.message-typing').forEach(element => {
            element.parentNode.removeChild(element);
        });
    }

    function scrollToBottom() {
        messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
});