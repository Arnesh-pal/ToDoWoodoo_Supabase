"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'antd';

export default function PomodoroTimer({ onSaveSession }) {
    const [initialDuration, setInitialDuration] = useState(25 * 60); // Time in seconds
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);

    // Use a ref for the interval to prevent issues with closures
    const intervalRef = useRef(null);

    const handleTimerEnd = useCallback(() => {
        setIsActive(false);
        if (onSaveSession) {
            // Save the original duration, not the final second
            onSaveSession({ duration: initialDuration });
        }
    }, [onSaveSession, initialDuration]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive]);

    // This separate effect watches for when the timer reaches zero
    useEffect(() => {
        if (timeLeft <= 0 && isActive) {
            handleTimerEnd();
        }
    }, [timeLeft, isActive, handleTimerEnd]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = (durationInMinutes) => {
        setIsActive(false);
        const durationInSeconds = durationInMinutes * 60;
        setInitialDuration(durationInSeconds);
        setTimeLeft(durationInSeconds);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm text-center flex flex-col justify-center items-center h-full">
            <h2 className="text-lg font-bold text-foreground mb-4">⏳ Pomodoro Timer</h2>
            <p className="text-5xl md:text-7xl font-mono font-bold text-primary my-4">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <div className="flex gap-4 mb-4">
                <Button onClick={toggleTimer} type="primary" size="large" danger={isActive} className={isActive ? "" : "!bg-primary hover:!bg-primary/90"}>
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={() => resetTimer(initialDuration / 60)} size="large" className="hover:!border-border hover:!text-foreground">
                    Reset
                </Button>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => resetTimer(25)} type={(initialDuration / 60) === 25 ? "primary" : "default"} className={(initialDuration / 60) === 25 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>25 min</Button>
                <Button onClick={() => resetTimer(10)} type={(initialDuration / 60) === 10 ? "primary" : "default"} className={(initialDuration / 60) === 10 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>10 min</Button>
                <Button onClick={() => resetTimer(5)} type={(initialDuration / 60) === 5 ? "primary" : "default"} className={(initialDuration / 60) === 5 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>5 min</Button>
                <Button onClick={() => resetTimer(1 / 12)}>5 sec</Button> {/* <-- TEST BUTTON ADDED */}
            </div>
        </div>
    );
}