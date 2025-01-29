document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    console.log("user:", socket);
    socket.on('connect', () => {
        console.log(`Socket connected to the server..`);
    });

    const totalClients = document.getElementById("total-clients");
    const messageContainer = document.getElementById("message-container");
    const nameInput = document.getElementById("name-input");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    const userName = document.getElementById("user-name");
    const userNumber = document.getElementById("user-number");

    // Get item from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    userName.innerText = user.name;
    userNumber.innerText = user.phone;

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    })

    socket.on('total-clients', (data) => {
        totalClients.innerText = `Total clients: ${data}`;
    });

    function sendMessage() {
        if (messageInput.value === '') return;

        const from = user._id;
        const to = '6798f632c9b53b18b6dd8db9';
        const message = messageInput.value;
        const dateTime = new Date().toLocaleString();

        socket.emit('sendMessage', { from, to, message, dateTime }, (response) => {
            console.log('Message sent:', response.newMessage);
            addMessageToUI(true, response);
        });
        
        messageInput.value = '';
    }

    socket.on('loadOldMessages', (messages) => {
        messages.forEach((message) => {
            console.log(message)
            addMessageToUI(false, message);
        })
    });

    socket.on('chat-message', (data) => {
        console.log(data)
        addMessageToUI(false, data);
    });

    function addMessageToUI(isOwnMessage, data) {
        console.log('isOwnMessage:', data);
        clearTyping();
        const element = `<li class="${isOwnMessage ? 'message-left' : 'message-right'}">
                <p>${data.newMessage.message}</p>
                <span>${data.newMessage.from} &#x2022; ${data.newMessage.dateTime}</span>
            </li>
    `
        messageContainer.innerHTML += element;
        scrollToBottom();
    }

    // While user focus on input field
    messageInput.addEventListener('focus', (e) => {
        socket.emit('typing', {
            typing: `${user.name} is typing a message...`
        })
    });

    // While user keypress on input field
    messageInput.addEventListener('keypress', (e) => {
        socket.emit('typing', {
            typing: `${user.name} is typing a message...`
        })
    });

    messageInput.addEventListener('blur', (e) => {
        socket.emit('typing', {
            typing: ''
        })
    });

    socket.on('typing', (data) => {
        clearTyping();
        const element = `<li class="message-typing">
                <p>${data.typing}</p>
            </li>
    `
        messageContainer.innerHTML += element;
        scrollToBottom();
    })

    function clearTyping() {
        document.querySelectorAll('li.message-typing').forEach(element => {
            element.parentNode.removeChild(element)
        })
    }

    function scrollToBottom() {
        messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
});