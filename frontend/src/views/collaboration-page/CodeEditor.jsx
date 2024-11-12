// Code editor referenced from https://github.com/SAMUDRALAARAVIND/code_deck/blob/main/src/screens/Playground/CodeEditor.jsx 

import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'

import { githubDark, githubLight } from '@uiw/codemirror-theme-github'

import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'

import { EditorState } from '@codemirror/state'

const CodeEditor = ({
    currentLanguage,
    currentTheme,
    currentCode,
    setCurrentCode
}) => {

    const [theme, setTheme] = useState(githubDark)
    const [language, setLanguage] = useState(javascript);

    useEffect(() => {
        if (currentLanguage === 'cpp') setLanguage(cpp);
        if (currentLanguage === 'java') setLanguage(java);
        if (currentLanguage === 'javascript') setLanguage(javascript);
        if (currentLanguage === 'python') setLanguage(python);
    }, [currentLanguage])


    useEffect(() => {
        if (currentTheme === 'githubDark') setTheme(githubDark);
        if (currentTheme === 'githubLight') setTheme(githubLight);
    }, [currentTheme])

    const calculateMinHeight = () => {
        const lines = 16; // Adjust this to your desired initial lines
        const lineHeight = 18; // Approximate line height in pixels
        return `${lines * lineHeight}px`; // Set the min-height based on the number of lines
    }

    return (
        <CodeMirror
            value={currentCode}
            height="100%"
            theme={theme}
            style={{ minHeight: calculateMinHeight() }}
            extensions={[
                language,
                EditorState.tabSize.of(4),
                EditorState.changeFilter.of(() => true)
            ]}
            onChange={(value) => setCurrentCode(value)}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
            }}
        />
    )
}

export default CodeEditor