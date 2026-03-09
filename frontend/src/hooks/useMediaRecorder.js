import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for browser-native MediaRecorder API
 */
export const useMediaRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const timerInterval = useRef(null);
    const streamRef = useRef(null);

    const startTimer = () => {
        setDuration(0);
        timerInterval.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorder.current = recorder;
            audioChunks.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stopTimer();
            };

            recorder.start();
            setIsRecording(true);
            setIsPaused(false);
            startTimer();
            setError(null);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Microphone permission denied or not found.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
            setIsPaused(false);
        }
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.pause();
            setIsPaused(true);
            stopTimer();
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
            mediaRecorder.current.resume();
            setIsPaused(false);
            timerInterval.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
    }, []);

    const clearRecording = useCallback(() => {
        setAudioBlob(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setDuration(0);
    }, [audioUrl]);

    return {
        isRecording,
        isPaused,
        audioBlob,
        audioUrl,
        duration,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecording,
        stream: streamRef.current
    };
};
