"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProfile } from '../../../hooks/useProfile';
import { useVoiceInput } from '../../../hooks/useVoiceInput';
import { Loader2, CheckCircle, ArrowLeft, Send, Mic, MicOff, X, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { sessionApi, SessionResponse, ChatMessage, SessionEvaluationResponse, documentsApi } from '@/lib/api';
import { ContextSourcesModal, SalesEvaluationDisplay } from '@/components/sales';
import { SalesEvaluation } from '@/types/sales';

type SessionStatus = 'loading' | 'active' | 'completing' | 'completed' | 'error';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const { refreshSessions } = useProfile();
  const sessionId = params.id as string;
  
  // State
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [evaluation, setEvaluation] = useState<SessionEvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContextModal, setShowContextModal] = useState(false);
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
  const [documentCount, setDocumentCount] = useState(0);
  
  // Voice input hook
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported,
  } = useVoiceInput();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer for elapsed time
  useEffect(() => {
    if (status === 'active') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Load document count for Sales sessions
  useEffect(() => {
    const loadDocumentCount = async () => {
      if (session?.preparation_type === 'Sales') {
        try {
          const docs = await documentsApi.list({ limit: 1, skip: 0 });
          setDocumentCount(docs.total);
        } catch (err) {
          console.error('Failed to load document count:', err);
        }
      }
    };

    if (session) {
      loadDocumentCount();
    }
  }, [session]);

  // Sync voice transcript to input message
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Handle voice input errors
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
      // Clear voice error after 5 seconds
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [voiceError]);

  /**
   * Toggle voice recording
   */
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Load session data from backend
   */
  const loadSession = async () => {
    try {
      setStatus('loading');
      const sessionData = await sessionApi.getSession(sessionId);
      setSession(sessionData);
      setMessages(sessionData.transcript || []);
      
      // If session is completed, load evaluation
      if (sessionData.status === 'completed') {
        try {
          const evalData = await sessionApi.getEvaluation(sessionId);
          setEvaluation(evalData);
          setStatus('completed');
        } catch (e) {
          // Evaluation might not exist yet
          console.warn('No evaluation found:', e);
          setStatus('completed');
        }
      } else {
        setStatus('active');
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setStatus('error');
    }
  };

  /**
   * Send a message in the session
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setError(null);
    
    // Reset voice transcript when sending
    resetTranscript();

    try {
      // Add user message to UI immediately
      const tempUserMsg: ChatMessage = {
        role: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // Send to backend and get AI response
      const response = await sessionApi.sendMessage(sessionId, userMessage);

      // Add AI response to messages
      const aiMsg: ChatMessage = {
        role: 'ai',
        message: response.ai_response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the temporary user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  /**
   * Complete the session
   */
  const handleCompleteSession = async () => {
    if (messages.length < 6) {
      setError('Please have at least 3 conversation exchanges before completing the session.');
      return;
    }

    setStatus('completing');
    setError(null);

    try {
      // Complete the session
      await sessionApi.completeSession(sessionId);

      // Generate evaluation
      const evalData = await sessionApi.evaluateSession(sessionId);
      setEvaluation(evalData);

      // Refresh sessions list in profile
      await refreshSessions();

      setStatus('completed');
    } catch (err) {
      console.error('Failed to complete session:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete session');
      setStatus('active');
    }
  };

  /**
   * Format elapsed time as MM:SS
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading session...</h2>
        <p className="text-slate-400 mt-2">Preparing your practice environment</p>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Session Error</h2>
        <p className="text-slate-400 max-w-md mb-8 text-center">{error}</p>
        <Link
          href="/dashboard"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Return to Profile
        </Link>
      </div>
    );
  }

  // Completing state
  if (status === 'completing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Completing session...</h2>
        <p className="text-slate-400 mt-2">Generating your performance evaluation</p>
      </div>
    );
  }

  // Completed state
  if (status === 'completed' && evaluation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Session Completed!</h2>
        <p className="text-slate-400 max-w-md mb-8 text-center">
          Great job! Here's your performance evaluation.
        </p>

        {/* Evaluation Results */}
        <div className="max-w-4xl w-full mb-8">
          {session && session.preparation_type === 'Sales' && (evaluation as any).dimension_scores ? (
            // Sales-specific evaluation display
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <SalesEvaluationDisplay evaluation={evaluation as any as SalesEvaluation} />
            </div>
          ) : (
            // Standard evaluation display
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              {/* Overall Score */}
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <div className="text-6xl font-bold text-amber-400 mb-2">{evaluation.overall_score}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Overall Score</div>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{evaluation.universal_scores.clarity_structure}</div>
                  <div className="text-xs text-slate-400">Clarity & Structure</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{evaluation.universal_scores.relevance_focus}</div>
                  <div className="text-xs text-slate-400">Relevance & Focus</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{evaluation.universal_scores.confidence_delivery}</div>
                  <div className="text-xs text-slate-400">Confidence</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{evaluation.universal_scores.engagement}</div>
                  <div className="text-xs text-slate-400">Engagement</div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
                <p className="text-slate-300 leading-relaxed">{evaluation.summary}</p>
              </div>

              {/* Strengths */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Strengths</h3>
                <div className="space-y-2">
                  {evaluation.strengths.map((strength, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-300">
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Areas to Improve</h3>
                <div className="space-y-3">
                  {evaluation.improvement_areas.map((area, i) => (
                    <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{area.dimension}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          area.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          area.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {area.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{area.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Return to Profile
        </Link>
      </div>
    );
  }

  // Active session state
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between bg-slate-900/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-sm text-slate-300">
            LIVE SESSION • {formatTime(elapsedTime)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session && (
            <span className="text-xs text-slate-500">
              {session.preparation_type}
              {session.meeting_subtype && ` • ${session.meeting_subtype}`}
            </span>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Sales Session Context Banner */}
      {session && session.preparation_type === 'Sales' && session.context_payload && (
        <div className="bg-slate-900/50 border-b border-amber-400/20 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Customer:</span>
                <span className="text-white ml-2 font-medium">
                  {(session.context_payload as any).customer_name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Deal Stage:</span>
                <span className="text-amber-400 ml-2 font-medium">
                  {(session.context_payload as any).deal_stage || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Documents:</span>
                <span className="text-white ml-2 font-medium">
                  {documentCount} available
                </span>
              </div>
            </div>
            {(session.context_payload as any).customer_persona && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-slate-400 text-xs">Customer Persona:</span>
                <p className="text-slate-300 text-sm mt-1">
                  {(session.context_payload as any).customer_persona}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-20">
            <p className="text-lg mb-2">Session started!</p>
            <p className="text-sm">The AI will send you the first message shortly...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'ai' 
                  ? 'bg-amber-400/20 border border-amber-400/30' 
                  : 'bg-slate-800 border border-white/10'
              }`}>
                <span className={`font-bold text-xs ${
                  msg.role === 'ai' ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {msg.role === 'ai' ? 'AI' : 'YOU'}
                </span>
              </div>
              <div className={`rounded-2xl p-4 max-w-[80%] ${
                msg.role === 'ai'
                  ? 'bg-slate-900 border border-white/10 rounded-tl-none'
                  : 'bg-slate-800 border border-white/5 rounded-tr-none'
              }`}>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                
                {/* RAG Context Indicator for AI messages */}
                {msg.role === 'ai' && msg.retrieved_context_ids && msg.retrieved_context_ids.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => {
                        setSelectedContextIds(msg.retrieved_context_ids || []);
                        setShowContextModal(true);
                      }}
                      className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Used {msg.retrieved_context_ids.length} document(s) from knowledge base</span>
                      <span className="text-amber-400/50">→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isSending && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-xs text-amber-400">AI</span>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-tl-none p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          {/* Voice listening indicator */}
          {isListening && (
            <div className="mb-2 flex items-center justify-center gap-2 text-sm text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span>Listening...</span>
            </div>
          )}
          
          <div className="bg-slate-950 border border-white/10 rounded-xl p-2 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Speak now..." : "Type your response..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 px-2"
              disabled={isSending}
            />
            
            {/* Microphone Button */}
            {isVoiceSupported && (
              <button
                onClick={handleVoiceToggle}
                disabled={isSending}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isListening ? "Click to stop recording" : "Click to speak"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={20} />
            </button>
            
            {/* End Session Button */}
            <button
              onClick={handleCompleteSession}
              disabled={messages.length < 6}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={messages.length < 6 ? "Need at least 3 exchanges to complete" : "Complete session"}
            >
              End Session
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">
            {isVoiceSupported && 'Click mic to speak • '}Press Enter to send • Have at least 3 exchanges before ending
          </p>
        </div>
      </div>

      {/* Context Sources Modal */}
      {showContextModal && selectedContextIds.length > 0 && (
        <ContextSourcesModal
          documentIds={selectedContextIds}
          onClose={() => {
            setShowContextModal(false);
            setSelectedContextIds([]);
          }}
        />
      )}
    </div>
  );
}
