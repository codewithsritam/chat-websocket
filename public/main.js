const socket = io();
const totalClients = document.getElementById("total-clients");

socket.on('total-clients', (data) => {
    totalClients.innerText = `Total clients: ${data}`;
});