import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  CornerDownLeft,
  ChevronRight,
  Loader2,
  Trash2,
  HelpCircle,
  TreePine,
  Droplets,
  DollarSign
} from 'lucide-react';
import { api, CopilotResponse } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chips?: string[];
}

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const { budget } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am **EcoPulse Copilot**, your AI urban planning and climate intelligence assistant.\n\nI can assist you with:\n- **Zone-specific mitigation blueprints** (e.g., Whitefield, Bellandur, Koramangala)\n- **MCDA scoring criteria & algorithm explanations**\n- **Optimal capital deployment for ₹" + budget + " Crores**\n- **Technical engineering specs for green infrastructure assets**\n\nHow can I help plan your green infrastructure today?",
      timestamp: 'Just now',
      chips: [
        'Whitefield heat mitigation strategy',
        'Bellandur flood detention plan',
        'Optimal allocation for ₹25 Crores',
        'Compare rain gardens vs permeable pavements',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const data: CopilotResponse = await api.queryCopilot(textToSend, undefined, budget);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: data.suggestedChips,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "⚠️ **Offline / Fallback Notice:** Unable to reach the backend copilot endpoint. Based on local heuristics, priority interventions are focused on high-heat zones like Whitefield and high-runoff zones like Bellandur.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: ['Whitefield heat strategy', 'Optimal budget allocation'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render basic markdown bold and bullet points
  const formatMarkdown = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Bold replacement
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-xs text-text-primary leading-relaxed mb-1"
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li
            key={idx}
            className="ml-4 list-decimal text-xs text-text-primary leading-relaxed mb-1"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s/, '') }}
          />
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="text-xs text-text-primary leading-relaxed mb-1"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#0C1711] border-l border-emerald/20 shadow-2xl flex flex-col pointer-events-auto z-10"
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald/10 flex items-center justify-between bg-bg-secondary/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald shadow-emerald-glow">
                  <Sparkles className="w-5 h-5 text-emerald-bright" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    EcoPulse AI Copilot
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                      v2.4
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Context-aware urban planning intelligence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'reset',
                        sender: 'assistant',
                        text: 'Session reset. Ready for your next query.',
                        timestamp: 'Just now',
                      },
                    ])
                  }
                  title="Clear Conversation"
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {msg.sender === 'user' ? (
                      <>
                        <span className="text-[10px] text-text-secondary">{msg.timestamp}</span>
                        <span className="text-[11px] font-medium text-emerald">You</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-medium text-emerald-bright flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" /> EcoPulse AI
                        </span>
                        <span className="text-[10px] text-text-secondary">{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 ${
                      msg.sender === 'user'
                        ? 'bg-emerald text-bg-primary font-medium rounded-tr-sm shadow-emerald-glow'
                        : 'glass-card border-emerald/15 bg-bg-secondary/90 rounded-tl-sm text-text-primary'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    ) : (
                      <div>{formatMarkdown(msg.text)}</div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(chip)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-bg-secondary border border-emerald/20 text-emerald-bright hover:bg-emerald/10 hover:border-emerald/40 transition-all flex items-center gap-1"
                        >
                          <ChevronRight className="w-3 h-3 text-emerald" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-emerald p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing microclimate intelligence & planning data...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-emerald/10 bg-bg-secondary/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about Bengaluru zones, budgets, GI assets..."
                  className="flex-1 bg-bg-primary border border-emerald/20 rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-emerald"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-emerald text-bg-primary font-semibold hover:bg-emerald-bright disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-emerald-glow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-text-secondary text-center mt-2">
                Powered by FastAPI Engine · Data-aware for Greater Bengaluru Pilot Wards
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
