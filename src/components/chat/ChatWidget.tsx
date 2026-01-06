'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Ciao! 👋 Sono Marina, l\'assistente virtuale di YACHT~ME. Come posso aiutarti oggi?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session ID
    useEffect(() => {
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = uuidv4();
            localStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // Assuming n8n returns { message: "..." } or similar structure
            // Adjust based on actual n8n output structure in the API route
            const botReply = data.message || "Mi dispiace, ho avuto un problema tecnico. Riprova più tardi.";

            setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Scusa, c'è stato un errore di connessione. Riprova tra poco." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--gold-500)] text-[var(--navy-900)] shadow-lg flex items-center justify-center hover:bg-[var(--gold-400)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] h-[600px] max-h-[80vh] bg-[var(--navy-900)] border border-[var(--gold-500)]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-[var(--navy-800)] border-b border-[var(--gold-500)]/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--gold-500)]/20 flex items-center justify-center relative">
                                <Bot className="w-6 h-6 text-[var(--gold-500)]" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--navy-800)]"></div>
                            </div>
                            <div>
                                <h3 className="font-serif text-[var(--cream)] font-bold">Marina AI</h3>
                                <p className="text-xs text-[var(--gold-500)]">Online - YACHT~ME Assistant</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--navy-700)] scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-[var(--gold-500)] text-[var(--navy-900)] rounded-br-none'
                                                : 'bg-[var(--navy-800)] text-gray-100 rounded-bl-none border border-white/10'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-a:text-[var(--gold-500)]">
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-500)', textDecoration: 'underline' }} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--navy-800)] p-3 rounded-2xl rounded-bl-none border border-white/10">
                                        <Loader2 className="w-5 h-5 animate-spin text-[var(--gold-500)]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-[var(--navy-800)] border-t border-[var(--gold-500)]/20">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Scrivi un messaggio..."
                                    className="w-full bg-[var(--navy-900)] text-white pl-4 pr-12 py-3 rounded-xl border border-[var(--gold-500)]/30 focus:border-[var(--gold-500)] focus:outline-none focus:ring-1 focus:ring-[var(--gold-500)] transition-all placeholder:text-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 rounded-lg text-[var(--gold-500)] hover:bg-[var(--gold-500)]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
