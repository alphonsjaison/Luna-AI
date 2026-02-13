
import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-slate-950 pb-2">
      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Luna something... (truth hurts, humor helps)"
          className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-5 py-4 pr-16 text-sm text-slate-200 resize-none h-16 transition-all custom-scrollbar outline-none"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            input.trim() && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-500 scale-100'
              : 'bg-slate-800 text-slate-600 scale-95 opacity-50 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
      <div className="flex justify-between px-2 mt-2">
        <p className="text-[10px] text-slate-600 font-medium italic">
          Luna prioritizes facts. Sources are cited when possible.
        </p>
        <p className="text-[10px] text-slate-600 font-medium">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
