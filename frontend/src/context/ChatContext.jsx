import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api, isAuthenticated } from '../utils/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

// Polling interval for messages (in milliseconds)
const MESSAGE_POLL_INTERVAL = 3000; // 3 seconds
const CONVERSATION_POLL_INTERVAL = 10000; // 10 seconds

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pollingEnabled, setPollingEnabled] = useState(true);
    
    // Refs for polling intervals
    const messagePollingRef = useRef(null);
    const conversationPollingRef = useRef(null);

    // Fetch conversations from backend
    const fetchConversations = useCallback(async () => {
        if (!isAuthenticated()) return;
        
        setLoading(true);
        try {
            const response = await api.chat.getConversations();
            if (response.success && response.data) {
                // Transform backend data to frontend format
                const formattedConversations = response.data.map(conv => ({
                    id: conv.id,
                    name: conv.other_participant?.display_name || conv.other_participant?.username || 'Unknown',
                    participantId: conv.other_participant?.id,
                    lastMessage: conv.last_message?.content || 'No messages yet',
                    lastMessageTime: conv.last_message?.created_at,
                    unread: conv.unread_count || 0,
                    avatar: conv.other_participant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.other_participant?.username || conv.id}`,
                    online: conv.other_participant?.is_online || false,
                    isEncrypted: conv.is_encrypted
                }));
                setConversations(formattedConversations);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId || !isAuthenticated()) return;
        
        try {
            const response = await api.chat.getMessages(conversationId);
            // Handle both paginated response (results array) and direct array response
            const messagesData = response.results || response.data || response;
            if (messagesData && Array.isArray(messagesData)) {
                // Transform backend messages to frontend format
                const formattedMessages = messagesData.map(msg => ({
                    id: msg.id,
                    senderId: msg.sender,
                    senderName: msg.sender_username,
                    text: msg.content,
                    type: msg.message_type || 'text',
                    timestamp: msg.created_at,
                    sentiment: msg.sentiment,
                    isRead: msg.is_read
                })).reverse(); // Reverse to show oldest first
                setMessages(prev => ({
                    ...prev,
                    [conversationId]: formattedMessages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    }, []);

    // Load conversations when user logs in
    useEffect(() => {
        if (user) {
            fetchConversations();
        } else {
            setConversations([]);
            setMessages({});
            setActiveConversation(null);
        }
    }, [user, fetchConversations]);

    // Poll conversations periodically
    useEffect(() => {
        if (!user || !pollingEnabled) return;
        
        conversationPollingRef.current = setInterval(() => {
            if (isAuthenticated()) {
                fetchConversations();
            }
        }, CONVERSATION_POLL_INTERVAL);
        
        return () => {
            if (conversationPollingRef.current) {
                clearInterval(conversationPollingRef.current);
            }
        };
    }, [user, pollingEnabled, fetchConversations]);

    // Load messages when active conversation changes + poll for new messages
    useEffect(() => {
        if (activeConversation?.id) {
            // Initial fetch
            fetchMessages(activeConversation.id);
            // Mark as read
            api.chat.markAsRead(activeConversation.id).catch(console.error);
            
            // Set up polling for new messages
            if (pollingEnabled) {
                messagePollingRef.current = setInterval(() => {
                    if (isAuthenticated() && activeConversation?.id) {
                        fetchMessages(activeConversation.id);
                    }
                }, MESSAGE_POLL_INTERVAL);
            }
        }
        
        return () => {
            if (messagePollingRef.current) {
                clearInterval(messagePollingRef.current);
            }
        };
    }, [activeConversation?.id, fetchMessages, pollingEnabled]);

    // Send a message
    const sendMessage = async (text, type = 'text') => {
        if (!activeConversation || !text.trim()) return;

        // Optimistic update
        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            senderId: user?.id,
            text,
            type,
            timestamp: new Date().toISOString(),
            sentiment: 'neutral',
            pending: true
        };

        setMessages(prev => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), tempMessage]
        }));

        try {
            const response = await api.chat.sendMessage(activeConversation.id, text, type);
            
            if (response.success && response.data) {
                // Replace temp message with real one
                // Note: sender is returned as user ID, not nested object
                setMessages(prev => ({
                    ...prev,
                    [activeConversation.id]: prev[activeConversation.id].map(msg => 
                        msg.id === tempId ? {
                            id: response.data.id,
                            senderId: response.data.sender,
                            text: response.data.content,
                            type: response.data.message_type || 'text',
                            timestamp: response.data.created_at,
                            sentiment: response.data.sentiment
                        } : msg
                    )
                }));

                // Update conversation list
                setConversations(prev => prev.map(conv => 
                    conv.id === activeConversation.id ? {
                        ...conv,
                        lastMessage: text,
                        lastMessageTime: response.data.created_at
                    } : conv
                ));

                return { success: true, message: response.data };
            }
        } catch (err) {
            // Remove failed message
            setMessages(prev => ({
                ...prev,
                [activeConversation.id]: prev[activeConversation.id].filter(msg => msg.id !== tempId)
            }));
            console.error('Failed to send message:', err);
            return { success: false, error: 'Failed to send message' };
        }
    };

    // Start a new conversation
    const startConversation = async (participantId) => {
        try {
            const response = await api.chat.createConversation(participantId);
            if (response.success && response.data) {
                // Refresh conversations and set the new one as active
                await fetchConversations();
                setActiveConversation({
                    id: response.data.id,
                    participantId
                });
                return { success: true, conversation: response.data };
            }
            return { success: false, error: 'Failed to create conversation' };
        } catch (err) {
            console.error('Failed to start conversation:', err);
            return { success: false, error: 'Failed to start conversation' };
        }
    };

    // Get AI-composed message suggestion
    const getComposedMessage = async (context, mood) => {
        try {
            const response = await api.ai.composeMessage(context, mood);
            if (response.success) {
                return response.data.composed_message || response.data.message;
            }
            return null;
        } catch (err) {
            console.error('Failed to compose message:', err);
            return null;
        }
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            setActiveConversation,
            messages: activeConversation ? (messages[activeConversation.id] || []) : [],
            allMessages: messages,
            sendMessage,
            startConversation,
            fetchConversations,
            fetchMessages,
            getComposedMessage,
            loading,
            error,
            clearError: () => setError(null),
            // Polling controls
            pollingEnabled,
            setPollingEnabled,
            refreshMessages: () => activeConversation?.id && fetchMessages(activeConversation.id)
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
