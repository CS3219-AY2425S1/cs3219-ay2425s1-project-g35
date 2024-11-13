import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/');

socket.on('connect', () => {
    console.log('Connected to the backend with socket ID:', socket.id);

    // Send a match request after connecting
    fetch('http://localhost:3000/matcher/match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: '2',
            topic: 'Arrays',
            difficulty: 'Easy',
            socketId: socket.id
        }),
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
});

// Listen for matched events
socket.on('matched', (data) => {
    console.log('Match found:', data);
});

// Listen for disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from the backend');
});
