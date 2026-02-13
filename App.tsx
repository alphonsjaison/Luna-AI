
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ChatState, Role, GroundingSource, ChatSession } from './types';
import { geminiService } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';

const STORAGE_KEY = 'luna_ai_sessions';

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'model',
  text: "From the moon's perspective, things are looking pretty bright down there. I'm Luna. I'm witty, I'm honest, and I don't do fluff. What's on your mind?",
  timestamp: new Date()
};

const App: React.FC = () => {
  const loadSessions = (): ChatSession[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
    } catch (e) {
      console.error("Failed to load sessions", e);
      return [];
    }
  };

  const [state, setState] = useState<ChatState>(() => {
    const sessions = loadSessions();
    const currentSessionId = sessions.length > 0 ? sessions[0].id : null;
    return {
      sessions,
      currentSessionId,
      isLoading: false,
      error: null,
      isSidebarOpen: true
    };
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sessions));
  }, [state.sessions]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.currentSessionId, state.sessions, state.isLoading, scrollToBottom]);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
  const messages = currentSession?.messages || [INITIAL_MESSAGE];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Orbit',
      messages: [INITIAL_MESSAGE],
      updatedAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id,
      isSidebarOpen: window.innerWidth < 768 ? false : prev.isSidebarOpen
    }));
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== id);
      let newCurrentId = prev.currentSessionId;
      if (newCurrentId === id) {
        newCurrentId = newSessions.length > 0 ? newSessions[0].id : null;
      }
      return {
        ...prev,
        sessions: newSessions,
        currentSessionId: newCurrentId
      };
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || state.isLoading) return;

    let sessionId = state.currentSessionId;
    let sessions = [...state.sessions];

    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: Date.now()
      };
      sessionId = newSession.id;
      sessions = [newSession, ...sessions];
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    const targetSessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (targetSessionIndex !== -1) {
      const targetSession = sessions[targetSessionIndex];
      const userMessageCount = targetSession.messages.filter(m => m.role === 'user').length;
      if (userMessageCount === 0) {
        targetSession.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
      }
      targetSession.messages.push(userMessage);
      targetSession.updatedAt = Date.now();
    }

    setState(prev => ({
      ...prev,
      sessions,
      currentSessionId: sessionId,
      isLoading: true,
      error: null
    }));

    try {
      const history = sessions.find(s => s.id === sessionId)?.messages || [];
      // We pass the history excluding the user message we just added
      const response = await geminiService.sendMessage(history.slice(0, -1), text);
      const aiText = response.text || "I'm having a bit of a lunar eclipse moment and couldn't process that.";
      
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
          }
        });
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      setState(prev => {
        const updatedSessions = prev.sessions.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
              updatedAt: Date.now()
            };
          }
          return s;
        });
        return { ...prev, sessions: updatedSessions, isLoading: false };
      });
    } catch (err: any) {
      console.error("LUNA ERROR REPORT:", err);
      const isQuotaExceeded = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
      const isAuthError = err?.status === 401 || err?.status === 403 || err?.message?.includes('API_KEY');
      
      let errorMessage = "Orbit failure. Something went wrong while talking to the stars.";
      if (isQuotaExceeded) errorMessage = "Lunar quota exceeded. We're hitting a traffic jam in the stars.";
      if (isAuthError) errorMessage = "Authorization failed. Check if the API key is correctly set in the environment.";
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        sessions={state.sessions}
        currentSessionId={state.currentSessionId}
        isOpen={state.isSidebarOpen}
        onSelectSession={(id) => setState(prev => ({ 
          ...prev, 
          currentSessionId: id,
          isSidebarOpen: window.innerWidth < 768 ? false : prev.isSidebarOpen
        }))}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onToggle={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full max-w-5xl mx-auto w-full">
          <Header 
            onToggleSidebar={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))} 
            isSidebarOpen={state.isSidebarOpen}
          />
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto mt-6 mb-4 space-y-6 custom-scrollbar px-2"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {state.isLoading && (
              <div className="flex justify-start items-center space-x-2 text-slate-400 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <i className="fas fa-moon text-xs"></i>
                </div>
                <p className="text-sm italic">Luna is reflecting...</p>
              </div>
            )}
            
            {state.error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-200 text-sm flex flex-col items-start space-y-3">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  {state.error}
                </div>
                <p className="text-[10px] opacity-70">Check the browser console for technical details.</p>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSendMessage} disabled={state.isLoading} />
          
          <footer className="mt-4 text-center text-[10px] text-slate-600 font-light uppercase tracking-tighter">
            Powered by <i className="fab fa-google text-blue-400 mx-1"></i>. 
            Alphons Jaison.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
