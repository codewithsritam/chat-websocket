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
    const fromUser = JSON.parse(localStorage.getItem('from'));
    const toUser = JSON.parse(localStorage.getItem('to'));
    userName.innerText = toUser.name;
    userNumber.innerText = toUser.phone;

    const from = fromUser._id;
    const to = toUser.id;

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    })

    socket.on('total-clients', (data) => {
        totalClients.innerText = `Total clients: ${data}`;
    });

    function sendMessage() {
        if (messageInput.value === '') return;

        const message = messageInput.value;
        const dateTime = new Date().toLocaleString();

        socket.emit('sendMessage', { from, to, message, dateTime }, (response) => {
            console.log('Message sent:', response.newMessage);
            addMessageToUI(true, response);
        });
        
        messageInput.value = '';
    }

    socket.emit('getMessages', { from, to }, (response) => {
        response.newMessage.forEach((message) => {
            console.log('message: ', message);
            const newMessage = message
            addMessageToUI(false, newMessage);
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
            typing: `${fromUser.name} is typing a message...`
        })
    });

    // While user keypress on input field
    messageInput.addEventListener('keypress', (e) => {
        socket.emit('typing', {
            typing: `${fromUser.name} is typing a message...`
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