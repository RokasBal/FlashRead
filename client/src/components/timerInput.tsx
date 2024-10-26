import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';

interface TimerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onTimeChange: (seconds: number) => void;
}

const TimerInput: React.FC<TimerInputProps> = ({ className, id, onTimeChange, ...props }) => {
    const [inputSequence, setInputSequence] = useState<string>(''); // Initial state as empty string
    const [focused, setFocused] = useState<boolean>(false); // Track focus

    const formatToTimer = (sequence: string) => {
        const paddedSequence = sequence.padStart(4, '0');
        const minutes = paddedSequence.slice(0, 2);
        const seconds = paddedSequence.slice(2, 4);
        return `${minutes}:${seconds}`;
    };

    const convertToSeconds = (sequence: string) => {
        const paddedSequence = sequence.padStart(4, '0');
        const minutes = parseInt(paddedSequence.slice(0, 2), 10);
        const seconds = parseInt(paddedSequence.slice(2, 4), 10);
        return minutes * 60 + seconds;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digit characters
        if (value.length <= 4) {
            setInputSequence(value);
        } else if (value.length > 4) {
            setInputSequence(value.slice(-4));
        }
    };

    useEffect(() => {
        if (inputSequence === '' || formatToTimer(inputSequence) === '00:00') {
            onTimeChange(0); // Reset to 0 seconds if the input is empty or "00:00"
        } else {
            const totalSeconds = convertToSeconds(inputSequence);
            onTimeChange(totalSeconds);
        }
    }, [inputSequence, onTimeChange]);

    const displayValue = focused || (inputSequence && formatToTimer(inputSequence) !== '00:00')
        ? formatToTimer(inputSequence)
        : ''; // Show empty string if not focused and input is "00:00" or empty

    return (
        <TextField
            variant='outlined'
            label="Timer:"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            sx={{
                '& .MuiFormLabel-root': {
                    color: 'var(--textColor)', 
                },
                '& .MuiFormLabel-root.Mui-focused': {
                    color: '#1976d2',
                },
                '& .MuiInputBase-input': {
                    color: 'var(--textColor)',
                },
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderWidth: '3px',
                        borderColor: 'var(--borderColor)',
                    },
                    '&:hover fieldset': {
                        borderWidth: '3px',
                        borderColor: 'var(--borderColor)',
                    },
                    '&.Mui-focused fieldset': {
                        borderWidth: '3px',
                        borderColor: '#1976d2',
                    },
                    width: '100%',
                },
            }}
            id={id}
        />
    );
};

export default TimerInput;
