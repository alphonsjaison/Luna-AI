
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
          
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
            isUser 
              ? 'bg-blue-600 border-blue-400 text-white' 
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <i className={`fas ${isUser ? 'fa-user' : 'fa-moon'} text-xs`}></i>
          </div>

          {/* Bubble */}
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
            isUser 
              ? 'bg-blue-700 text-white rounded-tr-none' 
              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
          }`}>
            {message.image && (
              <div className="mb-3">
                <img 
                  src={`data:${message.image.mimeType};base64,${message.image.data}`} 
                  alt="Sent attachment" 
                  className="max-w-full rounded-lg border border-white/10"
                />
              </div>
            )}
            {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
            
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Grounding Sources</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] text-blue-400 transition-colors"
                    >
                      <i className="fas fa-link mr-1 opacity-50"></i>
                      {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <span className="mt-1 text-[10px] text-slate-600 px-12 italic">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
