import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../boards/css/timer.css';

interface TimerProps {
    className?: string;
    id?: string;
    initialTime?: number; // Initial time in seconds
    onComplete?: () => void; // Callback for when the timer reaches 0
    onTimeUpdate?: (formattedTime: string) => void; // Callback for each time update
}

export interface TimerHandle {
    reset: () => void;
    stop: () => void;
    getTime: () => number;
}

const TimerMode2 = forwardRef(({initialTime = 0, onComplete, onTimeUpdate }: TimerProps, ref) => {
    const [seconds, setSeconds] = useState(initialTime); 
    const [isActive, setIsActive] = useState(true); 

    useEffect(() => {
        const tick = () => {
            if (isActive) {
                const interval = setInterval(() => {
                    setSeconds((prev) => {
                        const newTime = initialTime > 0 ? prev - 1 : prev + 1;
                        if (initialTime > 0 && newTime <= 0) {
                            setIsActive(false);
                            clearInterval(interval);
                            onComplete?.();
                        }
                        onTimeUpdate?.(formatTime(newTime)); // Send formatted time to parent
                        return newTime;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }
        };

        return tick();
    }, [isActive, initialTime, onComplete, onTimeUpdate]);

    useEffect(() => {
        if (!isActive) {
            setSeconds(initialTime);
        }
    }, [initialTime, isActive]);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setSeconds(initialTime);
            setIsActive(true);
        },
        stop: () => {
            setIsActive(false);
        },
        getTime: () => seconds,
    }));

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="timer-container">
            <div className="timer-text-container" role='timer'>
                <h1>{formatTime(seconds)}</h1>
            </div>
        </div>
    );
});

export default TimerMode2;
