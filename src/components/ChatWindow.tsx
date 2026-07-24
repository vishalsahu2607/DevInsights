import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage, SourceCitation } from '../types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { SourceCitationPanel } from './SourceCitationPanel';
import { Plus, MessageSquare, Trash2, BookOpen, Bot, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  currentMessages: ChatMessage[];
  activeCitations: SourceCitation[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onSendMessage,
  isLoading,
  currentMessages,
  activeCitations,
}) => {
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [panelSources, setPanelSources] = useState<SourceCitation[]>(activeCitations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  useEffect(() => {
    if (activeCitations && activeCitations.length > 0) {
      setPanelSources(activeCitations);
    }
  }, [activeCitations]);

  const handleOpenMessageSources = (sources: SourceCitation[]) => {
    setPanelSources(sources);
    setShowSourcePanel(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-beige-100 overflow-hidden text-olive-950">
      {/* Sidebar: Conversation Sessions */}
      <div className="hidden md:flex flex-col w-64 bg-beige-50 border-r border-beige-300 p-3 shrink-0 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-beige-200">
          <span className="text-xs font-bold uppercase tracking-wider text-olive-800 font-mono">
            Chat Sessions
          </span>
          <button
            onClick={onCreateSession}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-olive-100 text-olive-800 hover:bg-olive-200 border border-olive-300 transition-all font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 my-3 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-beige-600 text-xs">No chat sessions yet.</div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-olive-100 text-olive-900 font-semibold border border-olive-300 shadow-sm'
                      : 'text-beige-700 hover:bg-beige-200/80 hover:text-olive-950'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-olive-700' : 'text-beige-600'}`} />
                    <span className="truncate">{s.title || 'Untitled Session'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-beige-600 hover:text-rose-600 p-1 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Chat Bar */}
        <div className="px-6 py-3 border-b border-beige-300 bg-beige-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-olive-100 border border-olive-300 text-olive-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-olive-950 flex items-center gap-2">
                <span>DevInsights RAG Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-olive-100 text-olive-800 border border-olive-300 font-bold">
                  Gemma 3.6 Flash
                </span>
              </h2>
              <p className="text-[11px] text-beige-700 font-mono">
                Ask engineering questions with automatic vector knowledge citation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showSourcePanel
                  ? 'bg-olive-100 text-olive-900 border-olive-400 shadow-sm'
                  : 'bg-beige-200 text-olive-900 border-beige-300 hover:bg-beige-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-olive-700" />
              <span className="hidden sm:inline">Citations Panel</span>
              {panelSources.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-olive-700 text-white text-[10px] font-bold">
                  {panelSources.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 text-beige-700">
              <div className="p-4 rounded-2xl bg-beige-50 border border-beige-300 text-olive-700 shadow-sm">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-olive-950">Ask Your Engineering Knowledge Base</h3>
              <p className="text-xs text-beige-700 leading-relaxed">
                DevInsights retrieves code sections, PDF docs, architecture specs, and incident postmortems using vector embeddings to generate contextual answers with source citations.
              </p>
            </div>
          ) : (
            currentMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onOpenSources={() => handleOpenMessageSources(msg.sources)}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-beige-50 border border-beige-300 w-fit">
              <Loader2 className="w-5 h-5 text-olive-700 animate-spin" />
              <span className="text-xs font-mono text-olive-800 animate-pulse font-semibold">
                Retrieving vector knowledge & synthesizing response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <div className="p-4 bg-beige-100 border-t border-beige-300">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Right Drawer: Source Citations Panel */}
      {showSourcePanel && (
        <SourceCitationPanel sources={panelSources} onClose={() => setShowSourcePanel(false)} />
      )}
    </div>
  );
};
