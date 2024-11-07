import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useCookies } from "react-cookie";
import styles from './Chat.module.css';

function Chat({ roomId }) {
    const [cookies] = useCookies(["username", "accessToken", "userId"]);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const userId = cookies.userId;
        const username = cookies.username;

        socketRef.current = io('http://localhost:3003', { query: { userId } });
        console.log('Connecting to the chat service server socket');

        socketRef.current.emit('joinRoom', { roomId });

        // const joinedState = localStorage.getItem(`chat-joined-${roomId}`) === 'true';

        // if (joinedState) {
        //     console.log('Emitting joinRoom for chat service');
        //     socketRef.current.emit('joinRoom', { roomId });
        //     localStorage.setItem(`chat-joined-${roomId}`, 'true');
        //     console.log('Emitting first_username');
        //     socketRef.current.emit('first_username', { roomId, username: cookies.username });
        // }

        socketRef.current.on('chat message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            console.log('Received chat message:', data.newMessage);
        });

        socketRef.current.on('load_room_content', (data) => {
            setMessages(data.messages);
            console.log('load_room_content event received');
        });

        return () => {
            console.log('Disconnecting socket');
            socketRef.current.disconnect();
        };
    }, [cookies, roomId]);

    useEffect(() => {
        // Scroll to the last message when messages are updated
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (msg) {
            socketRef.current.emit('chat message', { roomId, msg, username: cookies.username });
            setMsg(''); // Clear the input field after sending
            console.log('Sent chat message:', msg);
        }
    };

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            {!isOpen && (
                <button className={styles.chatButton} onClick={togglePopup}>
                    💬
                </button>
            )}

            {isOpen && (
                <div className={styles.chatPopup}>
                    <div className={styles.chatHeader}>
                        <strong>Chat</strong>
                        <button className={styles.closeButton} onClick={togglePopup}>X</button>
                    </div>
                    <ul className={styles.messagesList}>
                        {messages.map((msg, index) => (
                            <li key={index}>
                                <strong>{msg.senderUsername}</strong>: {msg.content} <br />
                                <small>{new Date(msg.timestamp).toLocaleString()}</small>
                            </li>
                        ))}
                        <div ref={messagesEndRef} />
                    </ul>
                    <form onSubmit={handleSubmit} className={styles.chatForm}>
                        <input
                            className={styles.chatInput}
                            id="input"
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            autoComplete="off"
                        />
                        <button className={styles.sendButton} type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chat;
