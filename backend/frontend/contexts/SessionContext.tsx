"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  sessionApi, 
  SessionResponse, 
  ChatMessage, 
  SessionEvaluationResponse,
  SessionCreate 
} from '@/lib/api';

interface SessionContextType {
  // Current session state
  currentSession: SessionResponse | null;
  messages: ChatMessage[];
  evaluation: SessionEvaluationResponse | null;
  
  // Loading states
  isLoading: boolean;
  isSending: boolean;
  isCompleting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  createSession: (data: SessionCreate) => Promise<SessionResponse>;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, message: string) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<SessionResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluation, setEvaluation] = useState<SessionEvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new session
   */
  const createSession = useCallback(async (data: SessionCreate): Promise<SessionResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await sessionApi.createSession(data);
      setCurrentSession(session);
      setMessages(session.transcript || []);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await sessionApi.getSession(sessionId);
      setCurrentSession(session);
      setMessages(session.transcript || []);
      
      // If session is completed, try to load evaluation
      if (session.status === 'completed') {
        try {
          const evalData = await sessionApi.getEvaluation(sessionId);
          setEvaluation(evalData);
        } catch (e) {
          console.warn('No evaluation found for completed session:', e);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a message in the current session
   */
  const sendMessage = useCallback(async (sessionId: string, message: string): Promise<void> => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      role: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await sessionApi.sendMessage(sessionId, message.trim());

      // Add AI response
      const aiMsg: ChatMessage = {
        role: 'ai',
        message: response.ai_response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  /**
   * Complete the current session
   */
  const completeSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsCompleting(true);
    setError(null);

    try {
      // Complete the session
      const completedSession = await sessionApi.completeSession(sessionId);
      setCurrentSession(completedSession);

      // Generate evaluation
      const evalData = await sessionApi.evaluateSession(sessionId);
      setEvaluation(evalData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, []);

  /**
   * Clear current session state
   */
  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
    setEvaluation(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SessionContextType = {
    currentSession,
    messages,
    evaluation,
    isLoading,
    isSending,
    isCompleting,
    error,
    createSession,
    loadSession,
    sendMessage,
    completeSession,
    clearSession,
    clearError
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to use session context
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}