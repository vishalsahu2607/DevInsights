import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { Bot, User, Copy, Check, BookOpen, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenSources?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOpenSources }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 my-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isAssistant
            ? 'bg-olive-700 text-beige-50 border border-olive-600'
            : 'bg-beige-300 text-beige-900 border border-beige-400'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Body */}
      <div className={`max-w-[88%] lg:max-w-[80%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-beige-700">
          <span>{isAssistant ? 'DevInsights Assistant' : 'You'}</span>
          <span>•</span>
          <span>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isAssistant && (
            <span className="flex items-center gap-1 text-olive-800 font-semibold bg-olive-100 px-1.5 py-0.2 rounded border border-olive-300 text-[10px]">
              <Sparkles className="w-2.5 h-2.5" />
              Gemma RAG
            </span>
          )}
        </div>

        <div
          className={`relative rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
            isAssistant
              ? 'bg-beige-50 border border-beige-300 text-olive-950'
              : 'bg-olive-800 border border-olive-700 text-beige-50'
          }`}
        >
          {/* Markdown Content */}
          <div className="prose prose-sm max-w-none prose-pre:bg-olive-950 prose-pre:border prose-pre:border-olive-800 prose-pre:text-beige-100 prose-code:text-olive-800 prose-a:text-olive-700">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Assistant Action Footer */}
          {isAssistant && (
            <div className="mt-3 pt-2 border-t border-beige-200 flex items-center justify-between text-xs text-beige-700 font-mono">
              <div className="flex items-center gap-2">
                {message.sources && message.sources.length > 0 && (
                  <button
                    onClick={onOpenSources}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-beige-200 hover:bg-beige-300 text-olive-800 border border-beige-300 text-[11px] font-semibold transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-olive-700" />
                    <span>View {message.sources.length} Cited Sources</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 hover:text-olive-950 transition-colors px-2 py-1 rounded bg-beige-200/80 border border-beige-300"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-olive-600" />
                    <span className="text-[10px] text-olive-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
