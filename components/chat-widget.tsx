'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget({ sourceId = 'default' }: { sourceId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    sourceId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Network response was not ok');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: ''
            };

            setMessages(prev => [...prev, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage.content += chunk;

                setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m));
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `죄송합니다. 오류가 발생했습니다.\n${error instanceof Error ? error.message : '알 수 없는 오류'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 font-sans">
            {/* Chat Window */}
            <div
                className={twMerge(
                    "bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden border border-gray-200",
                    isOpen ? "w-[380px] h-[600px] opacity-100 translate-y-0" : "w-0 h-0 opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <h3 className="font-semibold">지식산업센터 AI 컨설턴트</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded">
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10 text-sm">
                            <p>안녕하세요! 👋</p>
                            <p>지식산업센터 입주, 세금, 법률 등</p>
                            <p>궁금한 점을 물어보세요.</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={clsx(
                                "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-blue-600 text-white self-end ml-auto rounded-br-none"
                                    : "bg-white text-gray-800 border border-gray-100 self-start rounded-bl-none"
                            )}
                        >
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {m.content}
                            </div>
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

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="질문을 입력하세요..."
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

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={twMerge(
                    "absolute bottom-0 right-0 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110",
                    isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
                )}
            >
                <MessageCircle size={28} />
            </button>
        </div>
    );
}
