import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api, isAuthenticated, getAccessToken } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from '../utils/toast';

const ChatContext = createContext(null);

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
// Fallback poll interval used only when WebSocket is unavailable
const CONVERSATION_POLL_INTERVAL = 15000;

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});
    const [wsConnected, setWsConnected] = useState(false);

    // Refs
    const wsRef = useRef(null);
    const convPollRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const activeConvIdRef = useRef(null);

    // ── Fetch conversations (REST, used for initial load + reconnects) ────────
    const fetchConversations = useCallback(async () => {
        if (!isAuthenticated()) return;
        setLoading(true);
        try {
            const response = await api.chat.getConversations();
            if (response.success && response.data) {
                const formatted = response.data.map(conv => ({
                    id: conv.id,
                    name: conv.other_participant?.display_name ||
                          conv.other_participant?.username || 'Unknown',
                    participantId: conv.other_participant?.id,
                    lastMessage: conv.last_message?.content || 'No messages yet',
                    lastMessageTime: conv.last_message?.created_at,
                    unread: conv.unread_count || 0,
                    avatar: conv.other_participant?.avatar || null,
                    avatarUsername: conv.other_participant?.username,
                    online: conv.other_participant?.is_online || false,
                }));
                setConversations(formatted);
            }
        } catch {
            // Silent — conversations will reload on reconnect
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch messages for a conversation (REST) ──────────────────────────────
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId || !isAuthenticated()) return;
        try {
            const response = await api.chat.getMessages(conversationId);
            // API-20: handle both paginated {results} and {data} shapes
            const messagesData = response.results || response.data || [];
            if (Array.isArray(messagesData)) {
                const formatted = messagesData.map(msg => ({
                    id: msg.id,
                    senderId: msg.sender,
                    senderName: msg.sender_username,
                    senderAvatar: msg.sender_avatar,
                    text: msg.content,
                    type: msg.message_type || 'text',
                    timestamp: msg.created_at,
                    sentiment: msg.sentiment,
                    isRead: msg.is_read,
                    pending: false,
                })).reverse();
                setMessages(prev => ({ ...prev, [conversationId]: formatted }));
            }
        } catch {
            // Silent
        }
    }, []);

    // ── WebSocket connection ───────────────────────────────────────────────────
    const connectWebSocket = useCallback((conversationId) => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (!conversationId || !isAuthenticated()) return;

        const token = getAccessToken();
        const wsUrl = `${WS_BASE}/ws/chat/${conversationId}/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setWsConnected(true);
            setError(null);
        };

        ws.onclose = (e) => {
            setWsConnected(false);
            // Auto-reconnect after 3s unless intentionally closed
            if (e.code !== 1000 && activeConvIdRef.current === conversationId) {
                reconnectTimerRef.current = setTimeout(() => {
                    connectWebSocket(conversationId);
                }, 3000);
            }
        };

        ws.onerror = () => {
            setWsConnected(false);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWsMessage(data, conversationId);
            } catch {}
        };

        wsRef.current = ws;
    }, []);

    const handleWsMessage = useCallback((data, conversationId) => {
        switch (data.type) {
            case 'message': {
                const msg = data.message;
                const formatted = {
                    id: msg.id,
                    senderId: msg.sender_id,
                    senderName: msg.sender_username,
                    senderAvatar: msg.sender_avatar,
                    text: msg.content,
                    type: msg.message_type || 'text',
                    timestamp: msg.created_at,
                    sentiment: msg.sentiment,
                    isRead: false,
                    pending: false,
                };
                setMessages(prev => ({
                    ...prev,
                    [conversationId]: [...(prev[conversationId] || []), formatted]
                }));
                // Update conversation list preview
                setConversations(prev => prev.map(c =>
                    c.id === conversationId
                        ? { ...c, lastMessage: msg.content, lastMessageTime: msg.created_at }
                        : c
                ));
                break;
            }
            case 'typing': {
                const { user_id, username, is_typing } = data;
                setTypingUsers(prev => {
                    const next = { ...prev };
                    if (is_typing) next[user_id] = username;
                    else delete next[user_id];
                    return next;
                });
                break;
            }
            case 'read': {
                const { message_id } = data;
                setMessages(prev => {
                    const convMsgs = prev[conversationId] || [];
                    return {
                        ...prev,
                        [conversationId]: convMsgs.map(m =>
                            m.id === message_id ? { ...m, isRead: true } : m
                        )
                    };
                });
                break;
            }
            case 'user_joined':
            case 'user_left': {
                // Update online status in conversation list
                setConversations(prev => prev.map(c =>
                    c.id === conversationId
                        ? { ...c, online: data.type === 'user_joined' }
                        : c
                ));
                break;
            }
            default: break;
        }
    }, []);

    // ── Load conversations when user logs in ──────────────────────────────────
    useEffect(() => {
        if (user) {
            fetchConversations();
        } else {
            setConversations([]);
            setMessages({});
            setActiveConversation(null);
            if (wsRef.current) wsRef.current.close(1000);
        }
    }, [user, fetchConversations]);

    // ── Fallback conversation poll (when WS not connected) ───────────────────
    useEffect(() => {
        if (!user) return;
        const shouldPoll = () => !wsConnected && !document.hidden;

        convPollRef.current = setInterval(() => {
            if (shouldPoll()) fetchConversations();
        }, CONVERSATION_POLL_INTERVAL);

        const handleVisibility = () => {
            if (!document.hidden && !wsConnected) fetchConversations();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(convPollRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [user, wsConnected, fetchConversations]);

    // ── Connect WebSocket when active conversation changes ────────────────────
    useEffect(() => {
        activeConvIdRef.current = activeConversation?.id ?? null;

        if (activeConversation?.id) {
            fetchMessages(activeConversation.id);
            api.chat.markAsRead(activeConversation.id).catch(() => {});
            connectWebSocket(activeConversation.id);
        } else {
            if (wsRef.current) {
                wsRef.current.close(1000);
                wsRef.current = null;
            }
        }

        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        };
    }, [activeConversation?.id, fetchMessages, connectWebSocket]);

    // ── Send a message ────────────────────────────────────────────────────────
    const sendMessage = async (text, type = 'text') => {
        if (!activeConversation || !text.trim()) return;

        // Try WebSocket first (instant delivery)
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'message',
                content: text,
                message_type: type,
            }));
            return { success: true };
        }

        // Fallback to REST (FE-07: keep pending message separate to avoid wipe)
        const tempId = `pending-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            senderId: user?.id,
            text,
            type,
            timestamp: new Date().toISOString(),
            sentiment: 'neutral',
            pending: true,
        };

        setMessages(prev => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), tempMessage]
        }));

        try {
            const response = await api.chat.sendMessage(activeConversation.id, text, type);
            if (response.success && response.data) {
                setMessages(prev => ({
                    ...prev,
                    [activeConversation.id]: prev[activeConversation.id].map(msg =>
                        msg.id === tempId ? {
                            id: response.data.id,
                            senderId: response.data.sender,
                            text: response.data.content,
                            type: response.data.message_type || 'text',
                            timestamp: response.data.created_at,
                            sentiment: response.data.sentiment,
                            pending: false,
                        } : msg
                    )
                }));
                setConversations(prev => prev.map(c =>
                    c.id === activeConversation.id
                        ? { ...c, lastMessage: text, lastMessageTime: response.data.created_at }
                        : c
                ));
                return { success: true, message: response.data };
            }
        } catch {
            // Remove failed message
            setMessages(prev => ({
                ...prev,
                [activeConversation.id]: prev[activeConversation.id].filter(m => m.id !== tempId)
            }));
            toast.error('Failed to send message');
            return { success: false, error: 'Failed to send message' };
        }
    };

    // ── Send typing indicator ─────────────────────────────────────────────────
    const sendTypingIndicator = useCallback((isTyping) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
        }
    }, []);

    // ── Start a new conversation ──────────────────────────────────────────────
    const startConversation = async (participantId) => {
        try {
            const response = await api.chat.createConversation(participantId);
            if (response.success && response.data) {
                await fetchConversations();
                const conv = { id: response.data.id, participantId };
                setActiveConversation(conv);
                return { success: true, conversation: response.data };
            }
            return { success: false, error: 'Failed to create conversation' };
        } catch {
            return { success: false, error: 'Failed to start conversation' };
        }
    };

    // ── AI compose ────────────────────────────────────────────────────────────
    const getComposedMessage = async (context, mood) => {
        try {
            const response = await api.ai.composeMessage(context, mood);
            if (response.success) return response.data?.composed_message || response.data?.message;
            return null;
        } catch { return null; }
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            setActiveConversation,
            messages: activeConversation ? (messages[activeConversation.id] || []) : [],
            allMessages: messages,
            typingUsers,
            wsConnected,
            sendMessage,
            sendTypingIndicator,
            startConversation,
            fetchConversations,
            fetchMessages,
            getComposedMessage,
            loading,
            error,
            clearError: () => setError(null),
            refreshMessages: () => activeConversation?.id && fetchMessages(activeConversation.id),
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
