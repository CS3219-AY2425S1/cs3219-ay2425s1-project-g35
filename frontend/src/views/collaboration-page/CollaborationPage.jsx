import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";

import Question from '../../components/Question';
import CodeEditor from './CodeEditor';
import PartnerDisplay from '../../components/PartnerDisplay';
import useHistoryUpdate from '../../hooks/useHistoryUpdate';
import Chat from '../../components/Chat';

import styles from './CollaborationPage.module.css';

const CollaborationPage = () => {
    const [cookies] = useCookies(["username", "accessToken", "userId"]);
    const { roomId } = useParams();
    const [question, setQuestion] = useState(null);
    const [questionTitle, setQuestionTitle] = useState(null);
    const [questionContent, setQuestionContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState(''); // actual content to be displayed
    const [partnerUsername, setPartnerUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [language, setLanguage] = useState("javascript");
    const [theme, setTheme] = useState("githubLight");
    const { handleHistoryUpdate, isLoading: isHistoryLoading, isError: isHistoryError } = useHistoryUpdate();

    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        const userId = cookies.userId;
        socketRef.current = io('https://3103.seewhyjay.dev:3002', { query: { userId } });
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
            setQuestionTitle(data.question["Question Title"]);
            setQuestionContent(data.question["Question Description"])
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
            setQuestionTitle(data.question["Question Title"]);
            setQuestionContent(data.question["Question Description"])
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

        socketRef.current.on('languageUpdate', (data) => {
            console.log('languageUpdate event received: ', data.language);
            setLanguage(data.language);
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

    useEffect(() => {
        const interval = setTimeout(() => {
            console.log('Saving codeSnippet to localStorage');
            localStorage.setItem(`codeSnippet-${language}`, content);
            handleUpdateHistoryNow(language, content);
        }, 2000);
        return () => clearTimeout(interval);
    }, [content, language]);

    const handleUpdateHistoryNow = async (lang, code) => {
        console.log(`handleUpdateHistoryNow`)
        try {
            await handleHistoryUpdate(cookies.userId, roomId, questionTitle, questionContent, lang, code);
            console.log('History update completed.');
        } catch (error) {
            console.error('Error updating history:', error);
        }
    };

    const handleEditorChange = (newContent) => {
        setContent(newContent);
        console.log('Emitting editDocument with new content: ', newContent);
        socketRef.current.emit('editDocument', { roomId, content: newContent });
    };

    const handleLeave = () => {
        handleUpdateHistoryNow(language, content);

        const username = cookies.username;
        console.log('Emitting custom_disconnect before navigating away');
        localStorage.clear();
        socketRef.current.emit('custom_disconnect', { roomId, username });
        navigate('/cs3219-ay2425s1-project-g35/', { replace: true });
        socketRef.current.disconnect();
    };

    const handleLanguageChange = (newLanguage) => {
        const selectedLanguage = newLanguage.target.value
        setLanguage(selectedLanguage);

        const savedSnippet = localStorage.getItem(`codeSnippet-${selectedLanguage}`) || '';
        setContent(savedSnippet)

        console.log('Language change: ', selectedLanguage);
        socketRef.current.emit('editLanguage', { roomId, language: selectedLanguage });
        socketRef.current.emit('editDocument', { roomId, content: savedSnippet });
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme.target.value);
    }

    return (
        <div className={styles.CollaborationContainer}>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    
                    <div className={styles.editorContainer}>
                        <div className={styles.toolbar}>
                            <select value={language} onChange={handleLanguageChange}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>

                            <select value={theme} onChange={handleThemeChange}>
                                <option value="githubLight">Light</option>
                                <option value="githubDark">Dark</option>
                            </select>
                        </div>

                        <CodeEditor
                            currentLanguage={language}
                            currentTheme={theme}
                            currentCode={content}
                            setCurrentCode={handleEditorChange}
                        />
                    </div>

                    <div className={styles.questionAreaContainer}>
                        <div className={styles.questionArea}>
                            {question ? (
                                <Question
                                    name={questionTitle}
                                    description={questionContent}
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
                            <Chat className={styles.Chat} roomId={roomId} />
                        </div>
                    </div>
                    
                </>
            )}
        </div>
    );
};

export default CollaborationPage;
