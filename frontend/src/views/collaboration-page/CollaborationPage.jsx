import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Question from '../../components/Question';
import Editor from '@monaco-editor/react'; 

import styles from './CollaborationPage.module.css';

const CollaborationPage = () => {
    const [cookies] = useCookies(["accessToken", "userId"]);
    const { roomId } = useParams(); 
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState('');
    const [cursors, setCursors] = useState({});
    const [isJoined, setIsJoined] = useState(false);

    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        const userId = cookies.userId;
        socketRef.current = io('http://localhost:3002', { query: { userId } });
        console.log('Connecting to the collaboration service server socket');

        const joinedState = localStorage.getItem(`joined-${roomId}`) === 'true';

        if (joinedState) {
            socketRef.current.emit('joinRoom', { roomId });
            localStorage.setItem(`joined-${roomId}`, 'true');
        }
        
        socketRef.current.on('collaboration_ready', (data) => {
            setQuestion(data.question);
            setIsLoading(false);
            socketRef.current.emit('joinRoom', { roomId });
            localStorage.setItem(`joined-${roomId}`, 'true');
        });

        socketRef.current.on('load_room_content', (data) => {
            setQuestion(data.question);
            setContent(data.documentContent);
            setCursors(data.cursors);
            setIsLoading(false);
        });
        
        socketRef.current.on('documentUpdate', (data) => {
            setContent(data.content);
        });

        socketRef.current.on('cursorUpdate', (data) => {
            setCursors((prevCursors) => ({
                ...prevCursors,
                [data.userId]: data.cursorPosition,
            }));
        });

        socketRef.current.on('partner_disconnect', (data) => {
            alert(`Received partner_disconnect event from user: ${data.username}`);
        });
        
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId, cookies.userId]);

    const handleEditorChange = (newContent) => {
        setContent(newContent);
        socketRef.current.emit('editDocument', { roomId, content: newContent });
    };

    const handleLeave = () => {
        const username = cookies.username;
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
                            defaultLanguage="javascript"
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
                        <button onClick={handleLeave} className={styles.leaveRoomButton}>Leave Room</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CollaborationPage;
