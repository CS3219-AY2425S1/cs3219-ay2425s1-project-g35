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
    const templateMap = {
        'cpp': "#include <iostream>\n\n// YOUR FUNCTION BELOW\n\n// YOUR FUNCTION ABOVE\n\n\n// for testing\nint main() {\n  std::cout << /* put your function and parameters here */;\n}",
        'java': "public class Solution {\n  // YOUR FUNCTION BELOW\n\n  // YOUR FUNCTION ABOVE\n\n  // for testing\n  public static void main(String args[]) {\n    System.out.println(/* put your function with parameters here */);\n  }\n}",
        'javascript': "// YOUR FUNCTION BELOW\n\n// YOUR FUNCTION ABOVE\n\n\n// for testing\nconsole.log(/* put your function with parameters here */)",
        'python': "# YOUR FUNCTION BELOW\n\n# YOUR FUNCTION ABOVE\n\n\n# for testing\nprint('''put your function with parameters here''')"
    }

    const versionMap = {
        'cpp': '10.2.0',
        'java': '15.0.2',
        'javascript': '18.15.0',
        'python': '3.10.0'
    }

    // State to store each language's content
    const [content, setContent] = useState({
        javascript: templateMap['javascript'],
        python: templateMap['python'],
        cpp: templateMap['cpp'],
        java: templateMap['java']
    });
    
    const [cookies] = useCookies(["username", "accessToken", "userId"]);
    const { roomId } = useParams();
    const [question, setQuestion] = useState(null);
    const [questionTitle, setQuestionTitle] = useState(null);
    const [questionContent, setQuestionContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [partnerUsername, setPartnerUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [language, setLanguage] = useState("javascript");
    const [theme, setTheme] = useState("githubLight");
    const [executionResult, setExecutionResult] = useState('');

    const { handleHistoryUpdate, isLoading: isHistoryLoading, isError: isHistoryError } = useHistoryUpdate();

    const VITE_COLLABORATION_SERVICE_API = import.meta.env.VITE_COLLABORATION_SERVICE_API || 'http://localhost:3002';

    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        const userId = cookies.userId;
        socketRef.current = io(VITE_COLLABORATION_SERVICE_API, { 
            query: { userId },
            reconnection: true,        
            reconnectionAttempts: 3,    
            reconnectionDelay: 2000,       
            reconnectionDelayMax: 10000,   
            timeout: 20000,                
        });
        
        console.log('Connecting to the collaboration service server socket');

        console.log('Emitting joinRoom');
        socketRef.current.emit('joinRoom', { roomId });
        console.log('Emitting first_username');
        socketRef.current.emit('first_username', { roomId, username: cookies.username });
        

        socketRef.current.on('collaboration_ready', (data) => {
            setQuestion(data.question);
            setQuestionTitle(data.question["Question Title"]);
            setQuestionContent(data.question["Question Description"]);
            setIsLoading(false);
            console.log('collaboration_ready event received');
            socketRef.current.emit('first_username', { roomId, username: cookies.username });
        });

        socketRef.current.on('load_room_content', (data) => {
            setQuestion(data.question);
            setQuestionTitle(data.question["Question Title"]);
            setQuestionContent(data.question["Question Description"]);
            setContent(data.documentContent);
            setIsLoading(false);
            console.log('load_room_content event received');
            socketRef.current.emit('first_username', { roomId, username: cookies.username });
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
            console.log(`documentUpdate event received for language: ${data.language}`);
            setContent((prevContent) => ({ ...prevContent, [data.language]: data.content }));
        });

        socketRef.current.on('languageUpdate', (data) => {
            console.log(`languageUpdate event received: ${data.language}`);
            setLanguage(data.language);
            setContent((prevContent) => ({ ...prevContent, [data.language]: data.content }));
        });

        socketRef.current.on('reconnect_attempt', (attempt) => {
            console.log(`Attempting to reconnect... (${attempt})`);
        });
    
        socketRef.current.on('reconnect_failed', () => {
            console.error('Reconnection attempts failed');
            alert('Unable to reconnect to the server');
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
            localStorage.setItem(`codeSnippet-${language}`, content[language]);
            handleUpdateHistoryNow(language, content[language]);
        }, 2000);
        return () => clearTimeout(interval);
    }, [content, language]);

    const handleUpdateHistoryNow = async (lang, code) => {
        console.log(`handleUpdateHistoryNow`);
        try {
            await handleHistoryUpdate(cookies.userId, roomId, questionTitle, questionContent, lang, code);
            console.log('History update completed.');
        } catch (error) {
            console.error('Error updating history:', error);
        }
    };

    const handleEditorChange = (newContent) => {
        console.log(`Emitting editDocument with new content for language: ${language}`);
        setContent((prevContent) => ({ ...prevContent, [language]: newContent }));
        socketRef.current.emit('editDocument', { roomId, language, content: newContent });
    };

    const handleLeave = () => {
        handleUpdateHistoryNow(language, content[language]);
        
        const username = cookies.username;
        console.log('Emitting custom_disconnect before navigating away');
        localStorage.clear();
        
        socketRef.current.emit('custom_disconnect', { roomId, username }, () => {
            console.log('custom_disconnect acknowledged by server. Now disconnecting and navigating away.');
            navigate('/', { replace: true });
            socketRef.current.disconnect();
        });
    };
    
    const handleLanguageChange = (newLanguage) => {
        const selectedLanguage = newLanguage.target.value;
        setLanguage(selectedLanguage);

        const savedSnippet = localStorage.getItem(`codeSnippet-${selectedLanguage}`) || content[selectedLanguage];
        setContent((prevContent) => ({ ...prevContent, [selectedLanguage]: savedSnippet }));

        console.log('Language change to:', selectedLanguage);
        socketRef.current.emit('editLanguage', { roomId, language: selectedLanguage });
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme.target.value);
    }

    const handleExecuteCode = async () => {
        try {
            const apiEndpoint = 'https://emkc.org/api/v2/piston/execute';
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "language": String(language),
                    "version": versionMap[String(language)],
                    "files": [
                        {
                            "content": content[language]
                        }
                    ],
                })
            });
            
            const result = await response.json();
            if (result) {
                if (result.run.stdout) {
                    setExecutionResult(result.run.stdout);
                } else {
                    setExecutionResult(result.run.stderr);
                }
            } else {
                setExecutionResult("No response received");
            }
        } catch (error) {
            console.error("Execution error:", error);
            setExecutionResult(String(error));
        }
    };

    const handleResetCode = async () => {
        setContent((prevContent) => ({
            ...prevContent,
            [language]: templateMap[language]
        }));
        socketRef.current.emit('editDocument', { roomId, language, content: templateMap[language] });
    };
      
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
                            currentCode={content[language]}
                            setCurrentCode={handleEditorChange}
                        />

                        <div className={styles.codeButtons}>
                            <button onClick={handleExecuteCode} className={styles.runCodeButton}>Run Code</button>
                            <button onClick={handleResetCode} className={styles.resetButton}>Reset</button>
                        </div>
                        <p className={styles.outputBox}><b>Output:</b> {executionResult}</p>
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
