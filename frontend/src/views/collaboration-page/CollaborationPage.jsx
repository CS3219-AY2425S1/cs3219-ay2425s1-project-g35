import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Question from '../../components/Question';
import Editor from '@monaco-editor/react'; 
import PartnerDisplay from '../../components/PartnerDisplay';

import styles from './CollaborationPage.module.css';

const CollaborationPage = () => {
    const [cookies] = useCookies(["username", "accessToken", "userId"]);
    const { roomId } = useParams(); 
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState('');
    const [partnerUsername, setPartnerUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        const userId = cookies.userId;
        socketRef.current = io('http://localhost:3002', { query: { userId } });
        console.log('Connecting to the collaboration service server socket');

        const joinedState = localStorage.getItem(`joined-${roomId}`) === 'true';

        if (joinedState) {
            console.log('Emitting joinRoom');
            socketRef.current.emit('joinRoom', { roomId });
            localStorage.setItem(`joined-${roomId}`, 'true');
            console.log('Emitting first_username');
            socketRef.current.emit('first_username', { roomId, username: cookies.username });
        }
        
        socketRef.current.on('collaboration_ready', (data) => {
            setQuestion(data.question);
            setIsLoading(false);
            console.log('collaboration_ready event received');
            console.log('Emitting joinRoom');
            socketRef.current.emit('joinRoom', { roomId });
            localStorage.setItem(`joined-${roomId}`, 'true');
            console.log('Emitting first_username');
            socketRef.current.emit('first_username', { roomId, username: cookies.username });
        });

        socketRef.current.on('load_room_content', (data) => {
            setQuestion(data.question);
            setContent(data.documentContent);
            setIsLoading(false);
            console.log('load_room_content event received');
        });

        socketRef.current.on('first_username', (data) => {
            console.log(`Received partner_username event from user: ${data.username}`);
            setPartnerUsername(data.username);
            console.log('Emitting second_username');
            socketRef.current.emit('second_username', { roomId, username: cookies.username });
            setIsConnected(true);
        });

        socketRef.current.on('second_username', (data) => {
            console.log(`Received partner_username event from user: ${data.username}`);
            setPartnerUsername(data.username);
            setIsConnected(true);
        });
        
        socketRef.current.on('documentUpdate', (data) => {
            console.log('documentUpdate event received: ', data.content);
            setContent(data.content);
        });

        socketRef.current.on('partner_disconnect', (data) => {
            alert(`${data.username} has left the room!`);
            console.log(`partner_disconnect event received for user: ${data.username}`);
            setIsConnected(false);
        });
        
        return () => {
            console.log('Disconnecting socket');
            socketRef.current.disconnect();
        };
    }, [roomId, cookies.userId]);

    const handleEditorChange = (newContent) => {
        setContent(newContent);
        console.log('Emitting editDocument with new content: ', newContent);
        socketRef.current.emit('editDocument', { roomId, content: newContent });
    };

    const handleLeave = () => {
        const username = cookies.username;
        console.log('Emitting custom_disconnect before navigating away');
        socketRef.current.emit('custom_disconnect', { roomId, username });
        navigate('/', { replace: true });
        socketRef.current.disconnect();
    };

    return (
        <div className={styles.CollaborationContainer}>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="editorContainer">
                        <Editor
                            height="100%"
                            theme="light"
                            value={content}
                            onChange={handleEditorChange}
                            options={{
                                lineNumbers: "on",
                                minimap: { enabled: false },
                                fontSize: 16,
                                wordWrap: "on",
                                scrollBeyondLastLine: false,
                                renderIndentGuides: true,
                                automaticLayout: true,
                                cursorBlinking: "smooth",
                                padding: { top: 10 },
                                folding: true,
                            }}
                        />
                    </div>

                    <div className={styles.questionAreaContainer}>
                        <div className={styles.questionArea}>
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
                        </div>
                        <div className={styles.questionFooter}>
                            <PartnerDisplay partnerUsername={partnerUsername} isConnected={isConnected} />
                            <button onClick={handleLeave} className={styles.leaveRoomButton}>Leave Room</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CollaborationPage;
