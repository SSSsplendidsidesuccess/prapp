"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for voice input using Web Speech API
 * Provides speech-to-text functionality for browser-based voice input
 */
export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Handle speech recognition results
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          // Update transcript with final results, or show interim results
          if (finalTranscript) {
            setTranscript(prev => (prev + finalTranscript).trim());
          } else if (interimTranscript) {
            setTranscript(prev => prev + interimTranscript);
          }
        };

        // Handle errors
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          switch (event.error) {
            case 'not-allowed':
              setError('Microphone access denied. Please enable permissions in your browser settings.');
              break;
            case 'no-speech':
              setError('No speech detected. Please try again.');
              break;
            case 'network':
              setError('Network error. Please check your connection.');
              break;
            case 'aborted':
              // User stopped, not really an error
              setError(null);
              break;
            default:
              setError('Could not recognize speech. Please try again.');
          }
          
          setIsListening(false);
        };

        // Handle recognition end
        recognition.onend = () => {
          setIsListening(false);
        };

        // Handle recognition start
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current = recognition;
      }
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setError(null);
      setTranscript(''); // Clear previous transcript when starting new recording
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice input. Please try again.');
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Failed to stop recognition:', err);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
