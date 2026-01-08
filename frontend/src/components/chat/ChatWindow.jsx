import { useRef, useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import { Send, Mic, Paperclip, Phone, Video } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function ChatWindow() {
    const { activeConversation, messages, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechToText();
    const { sttEnabled } = useAccessibility();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Sync transcript with input but allow manual edits
        if (transcript) {
            setInputValue(prev => {
                // If transcript is new, replace or append? 
                // Simple approach: Use transcript as value (replace) or append if we manage complex logic
                // Here we let transcript drive input when active
                return transcript;
            });
        }
    }, [transcript]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
        setTranscript('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Send size={40} className="text-gray-400 opacity-50 ml-2" />
                </div>
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Select a conversation</h2>
                <p className="text-sm mt-2">Choose a contact to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={activeConversation.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-300" />
                        {activeConversation.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white">{activeConversation.name}</h2>
                        <span className={`text-xs font-medium ${activeConversation.online ? 'text-green-600' : 'text-gray-400'}`}>
                            {activeConversation.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" aria-label="Call">
                        <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" aria-label="Video Call">
                        <Video size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-950/50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : messages.map((msg, index) => (
                    <MessageBubble key={msg.id || index} message={msg} isOwn={msg.senderId === 1} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 items-end max-w-4xl mx-auto">
                    <button className="p-3 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition" aria-label="Attach file">
                        <Paperclip size={20} />
                    </button>

                    <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-3xl border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => { setInputValue(e.target.value); setTranscript(e.target.value); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full p-3 px-4 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-gray-900 dark:text-white placeholder-gray-500"
                            rows={1}
                            style={{ minHeight: '48px' }}
                        />
                        {(sttEnabled || true) && (
                            <button
                                className={`absolute right-2 bottom-1.5 p-2 rounded-full transition-all duration-200 ${isListening
                                        ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110'
                                        : 'text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                onMouseDown={startListening}
                                onMouseUp={stopListening}
                                onTouchStart={startListening}
                                onTouchEnd={stopListening}
                                title="Hold to speak"
                                aria-label="Voice input"
                            >
                                <Mic size={20} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
