
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ChatState, Role, GroundingSource, ChatSession, MessageImage } from './types';
import { geminiService } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';

// External AI Studio global types
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Removed readonly to fix "All declarations of 'aistudio' must have identical modifiers" error.
    aistudio: AIStudio;
  }
}

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

  // FIX: Added mandatory check for API key selection on mount as per guidelines.
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // Mandatory step before accessing the main app.
          await window.aistudio.openSelectKey();
        }
      }
    };
    checkKey();
  }, []);

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

  const handleOpenKeyDialog = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setState(prev => ({ ...prev, error: null }));
      }
    } catch (err) {
      console.error("Failed to open key dialog", err);
    }
  };

  const handleSendMessage = async (text: string, image?: MessageImage) => {
    if ((!text.trim() && !image) || state.isLoading) return;

    let sessionId = state.currentSessionId;
    let sessions = [...state.sessions];

    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text ? (text.substring(0, 30) + (text.length > 30 ? '...' : '')) : 'Image Transmission',
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
      image,
      timestamp: new Date()
    };

    const targetSessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (targetSessionIndex !== -1) {
      sessions[targetSessionIndex].messages.push(userMessage);
      sessions[targetSessionIndex].updatedAt = Date.now();
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
      // Pass the current text and image along with history (excluding the user message just added to avoid duplicate current turn)
      const response = await geminiService.sendMessage(history.slice(0, -1), text, image);
      const aiText = response.text || "I'm having a bit of a lunar eclipse moment.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, aiMessage], updatedAt: Date.now() } : s),
        isLoading: false
      }));
    } catch (err: any) {
      console.error("LUNA ERROR:", err);
      const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
      // FIX: Handle "Requested entity was not found" error by prompting user to select key again.
      const isNotFound = err?.message?.includes("Requested entity was not found");

      if (isNotFound && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: isQuota 
          ? "Quota exceeded. This usually happens on free keys. You can switch to your own paid key to fix this." 
          : isNotFound
            ? "API Key error: Requested entity not found. Please select a valid key from a paid project."
            : "Orbit failure. Something went wrong while talking to the stars."
      }));
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        sessions={state.sessions}
        currentSessionId={state.currentSessionId}
        isOpen={state.isSidebarOpen}
        onSelectSession={(id) => setState(prev => ({ ...prev, currentSessionId: id }))}
        onNewChat={() => {
          const newSession = { id: Date.now().toString(), title: 'New Orbit', messages: [INITIAL_MESSAGE], updatedAt: Date.now() };
          setState(prev => ({ ...prev, sessions: [newSession, ...prev.sessions], currentSessionId: newSession.id }));
        }}
        onDeleteSession={(id, e) => {
          e.stopPropagation();
          setState(prev => ({ ...prev, sessions: prev.sessions.filter(s => s.id !== id), currentSessionId: prev.currentSessionId === id ? null : prev.currentSessionId }));
        }}
        onToggle={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full max-w-5xl mx-auto w-full">
          <Header 
            onToggleSidebar={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))} 
            isSidebarOpen={state.isSidebarOpen}
          />
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto mt-6 mb-4 space-y-6 custom-scrollbar px-2">
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
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-200 text-sm">
                <div className="flex items-center mb-3">
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  {state.error}
                </div>
                {(state.error.includes("Quota") || state.error.includes("Key") || state.error.includes("API")) && (
                  <button 
                    onClick={handleOpenKeyDialog}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-lg text-xs font-bold transition-all"
                  >
                    <i className="fas fa-key mr-2"></i> Use my own API Key
                  </button>
                )}
              </div>
            )}
          </div>

          <ChatInput onSend={handleSendMessage} disabled={state.isLoading} />
          
          <footer className="mt-4 text-center text-[10px] text-slate-600 font-light uppercase tracking-tighter">
            Powered by <i className="fab fa-google text-blue-400 mx-1"></i>. Alphons Jaison.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
