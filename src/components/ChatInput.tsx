import React, { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  suggestedQuestions?: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  suggestedQuestions = [
    'Where is authentication implemented?',
    'Which file contains the login API?',
    'What caused the previous payment outage?',
    'Which database is used by the payment service?',
    'Which files should a new backend developer read first?',
  ],
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSendMessage(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Suggested Question Pills */}
      {suggestedQuestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-beige-700 font-mono text-[11px] shrink-0 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-olive-700" /> Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => onSendMessage(q)}
              className="shrink-0 px-3 py-1 rounded-full bg-beige-200 hover:bg-beige-300 border border-beige-300 text-olive-900 hover:text-olive-950 transition-all font-sans text-xs whitespace-nowrap shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-end rounded-2xl bg-beige-50 border border-beige-300 p-2 shadow-sm focus-within:border-olive-600 focus-within:ring-2 focus-within:ring-olive-600/20 transition-all">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask DevInsights anything about your code, architecture, or incidents... (e.g. 'Where is auth implemented?')"
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-olive-950 placeholder-beige-600 text-sm focus:outline-none resize-none px-3 py-1 font-sans"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="ml-2 p-3 rounded-xl bg-olive-700 hover:bg-olive-800 text-white font-semibold shadow-md shadow-olive-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
