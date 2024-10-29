import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams, useNavigate, replace } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Question from '../../components/Question';

import styles from './CollaborationPage.module.css';

const CollaborationPage = () => {
    const [cookies, setCookie] = useCookies(["accessToken", "userId"]);
    const { roomId } = useParams(); 
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState('');
    const [cursors, setCursors] = useState({});
    const [isJoined, setIsJoined] = useState(false);

    const navigate = useNavigate();

    // Create a ref for the socket instance
    const socketRef = useRef(null);


    useEffect(() => {
        const userId = cookies.userId;
        // Initialize the socket and store it in the ref
        socketRef.current = io('http://localhost:3002', {
            query: { userId }
        });
        console.log('Connecting to the collaboration service server socket');

        const joinedState = localStorage.getItem(`joined-${roomId}`) === 'true';

        if (joinedState) {
            socketRef.current.emit('joinRoom', { roomId });
            console.log('joinign room', roomId);
            localStorage.setItem(`joined-${roomId}`, 'true');
        }
        
        socketRef.current.on('collaboration_ready', (data) => {
            console.log('Received collaboration_ready event with data:', data);
            setQuestion(data.question);
            console.log('Joined room', roomId);
            socketRef.current.emit('joinRoom', { roomId });
            // Update loading state
            setIsLoading(false);
            localStorage.setItem(`joined-${roomId}`, 'true');
        });



        socketRef.current.on('load_room_content', (data) => {
            console.log(`Received load_room_content event with data: ${data}`);
            setQuestion(data.question);
            setContent(data.documentContent);
            setCursors(data.cursors);
            // Update loading state
            setIsLoading(false);
        });
        
        

        socketRef.current.on('documentUpdate', (data) => {
            console.log('Received documentUpdate event with content:', data.content);
            setContent(data.content);
        });

        socketRef.current.on('cursorUpdate', (data) => {
            console.log('Received cursorUpdate event from user:', data.userId, 'with cursor position:', data.cursorPosition);
            setCursors((prevCursors) => ({
                ...prevCursors,
                [data.userId]: data.cursorPosition,
            }));
        });

        socketRef.current.on('partner_disconnect', (data) => {
            console.log('Received partner_disconnect event from user:', data.userId);
            alert(`Received partner_disconnect event from user: ${data.userId}`);
        });
        // return () => {
        //     console.log('Disconnecting socket');
        //     socketRef.current.disconnect();
        // };
    }, [roomId, cookies.userId]);

    const handleEdit = (e) => {
        const newContent = e.target.value;
        console.log('User editing document. New content:', newContent);
        setContent(newContent);
        // Use the socket from the ref
        socketRef.current.emit('editDocument', { roomId, content: newContent });
        console.log('Emitted editDocument event with roomId:', roomId, 'and content:', newContent);
    };

    const handleCursorPosition = (position) => {
        const userId = cookies.userId; // Replace with dynamically generated user ID
        console.log('User cursor moved. Position:', position);
        // Use the socket from the ref
        socketRef.current.emit('updateCursor', { roomId, userId, cursorPosition: position });
        console.log('Emitted updateCursor event with roomId:', roomId, 'userId:', userId, 'and cursor position:', position);
    };

    const handleLeave = () => {
        socketRef.current.emit('custom_disconnect', { roomId });
        console.log('Emitted leaveRoom event with roomId:', roomId);
        navigate('/', { replace: true} );
        socketRef.current.disconnect();

    }

    return (
        <div className={styles.CollaborationContainer}>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    
                    <div>
                        <textarea
                            value={content}
                            onChange={handleEdit}
                            onMouseUp={(e) => handleCursorPosition(e.target.selectionStart)}
                            rows="10"
                            cols="50"
                        />
                    </div>

                    <div>
                        {/* <h1>Collaboration Room: {roomId}</h1> */}
                        {question ? (
                            <Question
                                name={question["Question Title"]}
                                description={question["Question Description"]}
                                topics={question["Question Categories"]}
                                leetcode_link={question["Link"]}
                                difficulty={question["Question Complexity"]}
                            />
                        ) : (
                            <p>Waiting for question...</p>
                        )}
                        <button onClick={handleLeave}>Leave Room</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CollaborationPage;
