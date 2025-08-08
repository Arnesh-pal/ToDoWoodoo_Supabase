"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';

export default function PomodoroTimer({ onSaveSession }) {
    const [duration, setDuration] = useState(25 * 60); // Total duration in seconds
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);

    // Use refs to store interval and callbacks to avoid stale closures
    const intervalRef = useRef(null);
    const onSaveSessionRef = useRef(onSaveSession);

    // Keep the onSaveSession ref updated with the latest prop
    useEffect(() => {
        onSaveSessionRef.current = onSaveSession;
    }, [onSaveSession]);

    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);

    const resetTimer = (newDurationInMinutes) => {
        pauseTimer();
        const newDurationInSeconds = newDurationInMinutes * 60;
        setDuration(newDurationInSeconds);
        setTimeLeft(newDurationInSeconds);
    };

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(intervalRef.current);
                        setIsActive(false);
                        if (onSaveSessionRef.current) {
                            onSaveSessionRef.current({ duration });
                        }
                        return duration; // Reset for next run
                    }
                    return newTime;
                });
            }, 1000);
        }

        // Cleanup interval on unmount or when isActive becomes false
        return () => clearInterval(intervalRef.current);
    }, [isActive, duration]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm text-center flex flex-col justify-center items-center h-full">
            <h2 className="text-lg font-bold text-foreground mb-4">⏳ Pomodoro Timer</h2>
            <p className="text-5xl md:text-7xl font-mono font-bold text-primary my-4">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <div className="flex gap-4 mb-4">
                <Button onClick={isActive ? pauseTimer : startTimer} type="primary" size="large" danger={isActive} className={isActive ? "" : "!bg-primary hover:!bg-primary/90"}>
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={() => resetTimer(duration / 60)} size="large" className="hover:!border-border hover:!text-foreground">
                    Reset
                </Button>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => resetTimer(25)} type={(duration / 60) === 25 ? "primary" : "default"} className={(duration / 60) === 25 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>25 min</Button>
                <Button onClick={() => resetTimer(10)} type={(duration / 60) === 10 ? "primary" : "default"} className={(duration / 60) === 10 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>10 min</Button>
                <Button onClick={() => resetTimer(5)} type={(duration / 60) === 5 ? "primary" : "default"} className={(duration / 60) === 5 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>5 min</Button>
                <Button onClick={() => resetTimer(1 / 12)}>5 sec</Button>
            </div>
        </div>
    );
}