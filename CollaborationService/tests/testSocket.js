import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/');

socket.on('connect', () => {
    console.log('Connected to the backend with socket ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from the backend');
});