import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { Message, LoadingState } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, isRefinement: boolean) => void;
  loadingState: LoadingState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, loadingState }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent, isRefinement: boolean) => {
    e.preventDefault();
    if (!input.trim() || loadingState !== LoadingState.IDLE) return;
    onSendMessage(input, isRefinement);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <MessageSquare size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Design Assistant</h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p className="text-sm">Ask questions about your design or type instructions to update the look.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {loadingState !== LoadingState.IDLE && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {loadingState === LoadingState.GENERATING ? 'Rendering design...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e, false);
              }
            }}
            placeholder="E.g., 'Make the rug blue' or 'Where can I buy this lamp?'"
            className="w-full pl-4 pr-4 pt-3 pb-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none text-sm outline-none transition-all"
            rows={2}
          />
          
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={(e) => handleSubmit(e, true)}
              disabled={!input.trim() || loadingState !== LoadingState.IDLE}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Generate a new image based on text"
            >
              <Sparkles size={14} />
              Update Look
            </button>
            
            <button
              onClick={(e) => handleSubmit(e, false)}
              disabled={!input.trim() || loadingState !== LoadingState.IDLE}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Just chat / Ask for advice"
            >
              <Send size={14} />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
