import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    // Mock initial data
    const [conversations, setConversations] = useState([
        { id: 1, name: 'Alice', lastMessage: 'Hey there!', unread: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', online: true },
        { id: 2, name: 'Bob', lastMessage: 'Meeting at 5?', unread: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', online: false },
    ]);
    const [activeConversation, setActiveConversation] = useState(null);

    // Messages state: Record<conversationId, Message[]>
    const [messages, setMessages] = useState({
        1: [
            { id: 1, senderId: 2, text: 'Hello!', timestamp: new Date(Date.now() - 100000).toISOString(), type: 'text' },
            { id: 2, senderId: 1, text: 'Hi Alice', timestamp: new Date(Date.now() - 90000).toISOString(), type: 'text' },
            { id: 3, senderId: 2, text: 'Hey there!', timestamp: new Date(Date.now() - 80000).toISOString(), type: 'text' },
        ],
        2: []
    });

    const sendMessage = (text, type = 'text') => {
        if (!activeConversation) return;

        const newMessage = {
            id: Date.now(),
            senderId: 1, // Current user
            text,
            type,
            timestamp: new Date().toISOString(),
            sentiment: 'neutral', // Placeholder
        };

        setMessages(prev => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), newMessage]
        }));

        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversation.id) {
                return {
                    ...conv,
                    lastMessage: type === 'text' ? text : 'Sent a file',
                    lastMessageTime: newMessage.timestamp
                };
            }
            return conv;
        }));
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            setConversations,
            activeConversation,
            setActiveConversation,
            messages: activeConversation ? (messages[activeConversation.id] || []) : [],
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
