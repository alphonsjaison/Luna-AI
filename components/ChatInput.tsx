
import React, { useState, KeyboardEvent, useRef, ChangeEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string, image?: { data: string, mimeType: string }) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || selectedImage) && !disabled) {
      onSend(input, selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(',')[1];
      setSelectedImage({
        data: base64String,
        mimeType: file.type
      });
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset file input value to allow selecting the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="sticky bottom-0 bg-slate-950 pb-2">
      {previewUrl && (
        <div className="relative mb-2 inline-block">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="h-24 w-auto rounded-lg border border-slate-700 object-cover"
          />
          <button 
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 shadow-lg"
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>
      )}
      
      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Luna something... (truth hurts, humor helps)"
          className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-5 py-4 pr-28 text-sm text-slate-200 resize-none h-16 transition-all custom-scrollbar outline-none"
          disabled={disabled}
        />
        
        <div className="absolute right-3 bottom-3 flex space-x-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              disabled ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <i className="fas fa-paperclip"></i>
          </button>
          
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || disabled}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              (input.trim() || selectedImage) && !disabled
                ? 'bg-blue-600 text-white hover:bg-blue-500 scale-100'
                : 'bg-slate-800 text-slate-600 scale-95 opacity-50 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <div className="flex justify-between px-2 mt-2">
        <p className="text-[10px] text-slate-600 font-medium italic">
          Luna can now "see" your images. Send them with a question.
        </p>
        <p className="text-[10px] text-slate-600 font-medium">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
