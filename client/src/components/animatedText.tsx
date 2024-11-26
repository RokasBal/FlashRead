import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import "../boards/css/mode1.css";
import "./css/animatedText.css"

interface AnimatedTextProps {
    text: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text }) => {
        const [visibleText, setVisibleText] = useState('');

        useEffect(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (text === null || text === undefined || text.length === 0 || index > text.length) {
                    clearInterval(interval);
                    return;
                }
                setVisibleText(text.substring(0, index));
                index++;
            }, 5);
            return () => clearInterval(interval); // Cleanup 
        }, [text]);

        return (
            <Typography variant="body1" className="animatedText" component={'span'} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {visibleText}
            </Typography>
        );
};

export default AnimatedText;
