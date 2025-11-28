"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { config } from '@/lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  sourceId?: string;
  mode?: 'widget' | 'embed';
}

// Main ChatWidget component
export default function ChatWidget({ sourceId = 'default', mode = 'widget' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(mode === 'embed');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(380);
  const [height, setHeight] = useState(600);
  const [resizing, setResizing] = useState<'width' | 'height' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (mode === 'embed') {
      setIsOpen(true);
    }
  }, [mode]);

  // Notify parent window about open state changes (for iframe resizing)
  useEffect(() => {
    if (mode === 'widget' && window.parent !== window) {
      window.parent.postMessage({ type: 'CHAT_OPEN_CHANGED', isOpen }, '*');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (mode === 'embed') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      if (resizing === 'width') {
        const newWidth = window.innerWidth - e.clientX - 16;
        const clampedWidth = Math.max(300, Math.min(newWidth, window.innerWidth - 32, 800));
        setWidth(clampedWidth);
      } else if (resizing === 'height') {
        const newHeight = window.innerHeight - e.clientY - 16;
        const clampedHeight = Math.max(400, Math.min(newHeight, window.innerHeight - 32));
        setHeight(clampedHeight);
      }
    };
    const handleMouseUp = () => setResizing(null);
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [resizing, mode]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], sourceId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Network response was not ok');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!response.body || !contentType.includes('text/event-stream')) {
        const text = await response.text();
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: text }]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content += chunk;
        setMessages(prev => prev.map(m => (m.id === assistantMessage.id ? { ...assistantMessage } : m)));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `죄송합니다. 오류가 발생했습니다.\n${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isWidget = mode === 'widget';

  return (
    <div className={clsx("font-sans", isWidget ? "fixed bottom-4 right-4 z-50" : "w-full h-full")}>
      {/* Chat Window */}
      <div
        ref={sidebarRef}
        style={isWidget ? { width, height } : { width: '100%', height: '100%' }}
        className={twMerge(
          'relative bg-white flex flex-col overflow-hidden',
          isWidget && 'rounded-2xl shadow-xl border border-slate-200 transition-all duration-300',
          isWidget && (isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'),
          !isWidget && 'h-full w-full'
        )}
      >
        {/* Resize Handles (Widget Mode Only) */}
        {isWidget && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-400/50 z-50 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); setResizing('width'); }}
            />
            <div
              className="absolute left-0 top-0 right-0 h-1.5 cursor-ns-resize hover:bg-blue-400/50 z-50 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); setResizing('height'); }}
            />
          </>
        )}

        {/* [중요] 헤더 영역: 챗봇의 제목과 닫기 버튼이 있습니다. */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h3 className="font-semibold">{config.chatbotName}</h3>
          </div>
          {isWidget && (
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded">
              <Minimize2 size={18} />
            </button>
          )}
        </div>

        {/* [중요] 메시지 영역: 대화 내용이 표시되는 곳입니다. */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm">
              {config.initialMessages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                'rounded-2xl p-3 text-sm shadow-sm',
                isWidget ? 'max-w-[85%]' : 'max-w-[80%]',
                m.role === 'user'
                  ? 'bg-blue-600 text-white self-end ml-auto rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 self-start rounded-bl-none'
              )}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="self-start bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* [중요] 입력 영역: 사용자가 질문을 입력하고 전송하는 곳입니다. */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input
              className="flex-1 min-w-0 bg-gray-100 text-gray-900 rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholderText}
              enterKeyHint="send"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Powered by RAG System</span>
          </div>
        </form>
      </div>

      {/* [중요] 토글 버튼 (위젯 모드 전용): 챗봇을 열고 닫는 둥근 버튼입니다. */}
      {isWidget && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={twMerge(
            'absolute bottom-0 right-0 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110',
            isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
          )}
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}

