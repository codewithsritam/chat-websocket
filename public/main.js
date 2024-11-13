const socket = io();

socket.on('connect', () => {
    console.log('Socket connected to the server..');
});

const totalClients = document.getElementById("total-clients");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
})

socket.on('total-clients', (data) => {
    totalClients.innerText = `Total clients: ${data}`;
});

function sendMessage() {
    if (messageInput.value === '') return;
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date().toLocaleString()
    }

    socket.emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';
}

socket.on('chat-message', (data) => {
    // console.log(data)
    addMessageToUI(false, data);
})

function addMessageToUI(isOwnMessage, data) {
    clearTyping();
    const element = `<li class="${isOwnMessage ? 'message-left' : 'message-right'}">
                <p>${data.message}</p>
                <span>${data.name} &#x2022; ${data.dateTime}</span>
            </li>
    `
    messageContainer.innerHTML += element;
    scrollToBottom();
}

messageInput.addEventListener('focus', (e) => {
    socket.emit('typing', {
        typing: `${nameInput.value} is typing a message...`
    })
});

messageInput.addEventListener('keypress', (e) => {
    socket.emit('typing', {
        typing: `${nameInput.value} is typing a message...`
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