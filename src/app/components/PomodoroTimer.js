"use client";
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';

export default function PomodoroTimer({ onSaveSession }) {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [initialDuration, setInitialDuration] = useState(25);

    useEffect(() => {
        let interval = null;
        if (isActive && (minutes > 0 || seconds > 0)) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else if (isActive && minutes === 0 && seconds === 0) {
            // Timer finished
            setIsActive(false);

            if (onSaveSession) {
                // We save the duration in seconds (e.g., 25 min * 60s)
                onSaveSession({ duration: initialDuration * 60 });
            }

            resetTimer(initialDuration);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, onSaveSession, initialDuration]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = (duration) => {
        setIsActive(false);
        setInitialDuration(duration);
        setMinutes(duration);
        setSeconds(0);
    };

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
                <Button onClick={() => resetTimer(initialDuration)} size="large" className="hover:!border-border hover:!text-foreground">
                    Reset
                </Button>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => resetTimer(25)} type={initialDuration === 25 ? "primary" : "default"} className={initialDuration === 25 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>25 min</Button>
                <Button onClick={() => resetTimer(10)} type={initialDuration === 10 ? "primary" : "default"} className={initialDuration === 10 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>10 min</Button>
                <Button onClick={() => resetTimer(5)} type={initialDuration === 5 ? "primary" : "default"} className={initialDuration === 5 ? "!bg-primary/80" : "bg-muted text-muted-foreground"}>5 min</Button>
            </div>
        </div>
    );
}