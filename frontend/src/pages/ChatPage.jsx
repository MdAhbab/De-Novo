import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSentimentAnalysis } from '../hooks/useSentimentAnalysis';
import { useWebcamDetection } from '../hooks/useWebcamDetection';
import { api } from '../utils/api';

const ChatPage = () => {
    const { user } = useAuth();
    const { 
        conversations, 
        activeConversation, 
        setActiveConversation, 
        messages, 
        sendMessage, 
        loading,
        fetchConversations,
        startConversation,
        pollingEnabled,
        setPollingEnabled,
        refreshMessages
    } = useChat();
    
    const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechToText();
    const { speak, speaking, cancel: cancelSpeech } = useTextToSpeech();
    const { analyze, getSentimentColor, getSentimentEmoji } = useSentimentAnalysis();
    const { 
        videoRef, 
        startCamera, 
        stopCamera, 
        captureFrame, 
        detectFaces, 
        active: cameraActive,
        faceCount,
        privacyAlert,
        lastDetection
    } = useWebcamDetection();
    
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [showMobileList, setShowMobileList] = useState(true);
    const [conversationMood, setConversationMood] = useState(null);
    const [analyzingMood, setAnalyzingMood] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    
    // Visual AI Camera Modal State
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [visualAnalysis, setVisualAnalysis] = useState(null);
    const [analyzingVisual, setAnalyzingVisual] = useState(false);
    const localVideoRef = useRef(null);
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Apply transcript from speech-to-text
    useEffect(() => {
        if (transcript) {
            setInputText(prev => prev + ' ' + transcript);
            clearTranscript();
        }
    }, [transcript, clearTranscript]);

    // Analyze conversation mood when messages change
    useEffect(() => {
        const analyzeConversationMood = async () => {
            if (messages.length < 2) {
                setConversationMood(null);
                return;
            }
            
            setAnalyzingMood(true);
            try {
                const messageTexts = messages.slice(-10).map(m => m.text); // Last 10 messages
                const response = await api.ai.analyzeConversationMood(messageTexts);
                if (response.success && response.data) {
                    setConversationMood(response.data);
                }
            } catch (err) {
                console.error('Failed to analyze conversation mood:', err);
            } finally {
                setAnalyzingMood(false);
            }
        };
        
        // Debounce mood analysis
        const timer = setTimeout(analyzeConversationMood, 1000);
        return () => clearTimeout(timer);
    }, [messages]);

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || 
            (filter === 'unread' && conv.unread > 0) ||
            (filter === 'favorites' && conv.isFavorite);
        return matchesSearch && matchesFilter;
    });

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        
        const text = inputText.trim();
        setInputText('');
        
        // Analyze sentiment before sending
        await analyze(text);
        await sendMessage(text, 'text');
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTextareaChange = (e) => {
        setInputText(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const speakMessage = (text) => {
        if (speaking) {
            cancelSpeech();
        } else {
            speak(text);
        }
    };

    const selectConversation = (conv) => {
        setActiveConversation(conv);
        setShowMobileList(false);
    };

    // Search for users to start new chat
    const handleUserSearch = async (query) => {
        setUserSearchQuery(query);
        if (query.length < 2) {
            setUserSearchResults([]);
            return;
        }
        
        setSearchingUsers(true);
        try {
            const response = await api.users.search(query);
            if (response.success && response.data) {
                // Filter out current user
                const filteredUsers = response.data.filter(u => u.id !== user?.id);
                setUserSearchResults(filteredUsers);
            }
        } catch (err) {
            console.error('User search failed:', err);
        } finally {
            setSearchingUsers(false);
        }
    };

    // Start a new conversation with a user
    const handleStartChat = async (targetUser) => {
        try {
            const result = await startConversation(targetUser.id);
            if (result.success) {
                setShowNewChatModal(false);
                setUserSearchQuery('');
                setUserSearchResults([]);
            }
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    // Camera/Visual AI Functions
    const openCameraModal = async () => {
        setShowCameraModal(true);
        setCapturedImage(null);
        setVisualAnalysis(null);
        // Start camera after modal opens
        setTimeout(async () => {
            if (localVideoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { width: 640, height: 480, facingMode: 'user' } 
                    });
                    localVideoRef.current.srcObject = stream;
                } catch (err) {
                    console.error('Camera access denied:', err);
                }
            }
        }, 100);
    };

    const closeCameraModal = () => {
        // Stop camera stream
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        setShowCameraModal(false);
        setCapturedImage(null);
        setVisualAnalysis(null);
    };

    const capturePhoto = () => {
        if (!localVideoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = localVideoRef.current.videoWidth || 640;
        canvas.height = localVideoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(localVideoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
    };

    const analyzeVisual = async () => {
        if (!capturedImage) return;
        
        setAnalyzingVisual(true);
        try {
            // Extract base64 data (remove data:image/jpeg;base64, prefix)
            const base64Data = capturedImage.split(',')[1];
            
            // Call face detection API
            const response = await api.ai.detectFaces(base64Data);
            
            if (response.success && response.data) {
                setVisualAnalysis(response.data);
            } else {
                setVisualAnalysis({ error: 'Analysis failed' });
            }
        } catch (err) {
            console.error('Visual analysis failed:', err);
            setVisualAnalysis({ error: err.message || 'Analysis failed' });
        } finally {
            setAnalyzingVisual(false);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setVisualAnalysis(null);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diff < 172800000) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const getSentimentBadge = (sentiment) => {
        const colors = {
            happy: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            sad: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            angry: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
            neutral: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            positive: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        };
        
        const icons = {
            happy: 'sentiment_satisfied',
            sad: 'sentiment_dissatisfied',
            angry: 'sentiment_very_dissatisfied',
            neutral: 'sentiment_neutral',
            positive: 'sentiment_satisfied',
            negative: 'sentiment_dissatisfied'
        };

        return (
            <span className={`flex items-center gap-1 ${colors[sentiment] || colors.neutral} px-1.5 py-0.5 rounded-md text-[10px] font-bold border`}>
                <span className="material-symbols-outlined text-[12px]">{icons[sentiment] || icons.neutral}</span>
                <span className="capitalize">{sentiment || 'neutral'}</span>
            </span>
        );
    };
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main h-screen overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar / Contacts List */}
            <aside className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-[380px] h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark z-20 shadow-soft md:shadow-none`}>
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">forum</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight dark:text-white">De-Novo</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowNewChatModal(true)}
                            className="size-10 rounded-full bg-primary text-white hover:bg-primary-dark flex items-center justify-center transition-colors shadow-md"
                            title="New Chat"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button 
                            onClick={() => fetchConversations()}
                            className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
                {/* Search */}
                <div className="px-6 pb-4">
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input 
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 text-base focus:ring-2 focus:ring-primary/50 transition-all dark:text-white placeholder:text-slate-400" 
                            placeholder="Search contacts..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {/* Tags/Filters */}
                <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        All Chats
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'unread' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} transition-colors`}
                    >
                        Unread
                    </button>
                    <button 
                        onClick={() => setFilter('favorites')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'favorites' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} transition-colors`}
                    >
                        Favorites
                    </button>
                </div>
                {/* Contact List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
                    {loading && conversations.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 block">chat_bubble_outline</span>
                            <p className="text-sm font-medium">No conversations yet</p>
                            <p className="text-xs">Start chatting with someone!</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div 
                                key={conv.id}
                                onClick={() => selectConversation(conv)}
                                className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer relative overflow-hidden transition-colors ${
                                    activeConversation?.id === conv.id 
                                        ? 'bg-primary/10 border border-primary/20' 
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                }`}
                            >
                                {activeConversation?.id === conv.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                                )}
                                <div className="relative size-12 shrink-0">
                                    {conv.avatar ? (
                                        <img 
                                            alt={conv.name} 
                                            className="w-full h-full object-cover rounded-full" 
                                            src={conv.avatar} 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                            {conv.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className={`absolute bottom-0 right-0 size-3 ${conv.online ? 'bg-green-500' : 'bg-slate-400'} border-2 border-white dark:border-surface-dark rounded-full`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-bold truncate ${activeConversation?.id === conv.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                            {conv.name}
                                        </h3>
                                        <span className={`text-xs ${activeConversation?.id === conv.id ? 'font-semibold text-primary' : 'text-slate-400'}`}>
                                            {formatTime(conv.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${activeConversation?.id === conv.id ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>
                                        {conv.unread > 0 && (
                                            <span className="size-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`${!showMobileList || activeConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full relative bg-background-light dark:bg-background-dark`}>
                {!activeConversation ? (
                    // No conversation selected
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4">chat</span>
                        <h2 className="text-xl font-bold mb-2">Welcome to De-Novo Chat</h2>
                        <p className="text-sm">Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="h-[72px] px-6 flex items-center justify-between bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setShowMobileList(true)}
                                    className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="relative">
                                    {activeConversation.avatar ? (
                                        <img 
                                            alt={activeConversation.name} 
                                            className="size-10 rounded-full object-cover" 
                                            src={activeConversation.avatar} 
                                        />
                                    ) : (
                                        <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                            {activeConversation.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className={`absolute bottom-0 right-0 size-2.5 ${activeConversation.online ? 'bg-green-500' : 'bg-slate-400'} border-2 border-white dark:border-surface-dark rounded-full`}></span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{activeConversation.name}</h2>
                                        {/* Conversation Mood Indicator */}
                                        {conversationMood && (
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                conversationMood.overall_mood === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                conversationMood.overall_mood === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {conversationMood.overall_mood === 'positive' ? 'sentiment_satisfied' :
                                                     conversationMood.overall_mood === 'negative' ? 'sentiment_dissatisfied' : 'sentiment_neutral'}
                                                </span>
                                                <span className="capitalize">{conversationMood.overall_mood || 'neutral'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {activeConversation.isEncrypted && (
                                            <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full px-1.5 py-0.5">
                                                <span className="material-symbols-outlined text-[10px] text-primary mr-1">verified_user</span>
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">E2E Encrypted</span>
                                            </span>
                                        )}
                                        {/* Polling Status Indicator */}
                                        <button 
                                            onClick={() => setPollingEnabled?.(!pollingEnabled)}
                                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                pollingEnabled 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                            }`}
                                            title={pollingEnabled ? 'Live updates enabled - Click to disable' : 'Live updates disabled - Click to enable'}
                                        >
                                            <span className={`material-symbols-outlined text-[10px] ${pollingEnabled ? 'animate-pulse' : ''}`}>
                                                {pollingEnabled ? 'sync' : 'sync_disabled'}
                                            </span>
                                            <span>{pollingEnabled ? 'Live' : 'Paused'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Manual Refresh Button */}
                                <button 
                                    onClick={refreshMessages}
                                    aria-label="Refresh Messages" 
                                    className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                                    title="Refresh messages"
                                >
                                    <span className="material-symbols-outlined">refresh</span>
                                </button>
                                <button aria-label="Start Voice Call" className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                                    <span className="material-symbols-outlined">call</span>
                                </button>
                                <button aria-label="Start Video Call" className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button aria-label="Chat Info" className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors md:mr-2">
                                    <span className="material-symbols-outlined">info</span>
                                </button>
                            </div>
                        </header>

                        {/* Conversation Mood Summary Bar */}
                        {conversationMood && messages.length >= 2 && (
                            <div className="px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Mood Analysis:</span>
                                    <div className="flex items-center gap-2">
                                        {/* Mood Score Bar */}
                                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${
                                                    conversationMood.score > 0.3 ? 'bg-green-500' :
                                                    conversationMood.score < -0.3 ? 'bg-red-500' : 'bg-amber-500'
                                                }`}
                                                style={{ width: `${Math.abs(conversationMood.score || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-600 dark:text-slate-300">
                                            {conversationMood.score > 0.3 ? '😊 Positive vibes' :
                                             conversationMood.score < -0.3 ? '😔 Needs attention' : '😐 Neutral'}
                                        </span>
                                    </div>
                                </div>
                                {analyzingMood && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                        Analyzing...
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM5NGEzYjgiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')" }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center">
                                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Today</span>
                                    </div>

                                    {messages.map((msg) => {
                                        const isOutgoing = msg.senderId === user?.id;
                                        
                                        // Sentiment-based styling
                                        const getSentimentBorderClass = (sentiment) => {
                                            if (!sentiment) return '';
                                            const sentimentLower = sentiment.toLowerCase();
                                            if (sentimentLower === 'positive' || sentimentLower === 'happy') return 'border-l-4 border-l-green-400';
                                            if (sentimentLower === 'negative' || sentimentLower === 'angry' || sentimentLower === 'sad') return 'border-l-4 border-l-red-400';
                                            return 'border-l-4 border-l-amber-400';
                                        };
                                        
                                        return (
                                            <div key={msg.id} className={`flex items-end gap-3 group/msg ${isOutgoing ? 'justify-end' : ''}`}>
                                                {!isOutgoing && (
                                                    activeConversation.avatar ? (
                                                        <img 
                                                            alt={activeConversation.name} 
                                                            className="size-8 rounded-full object-cover mb-1" 
                                                            src={activeConversation.avatar} 
                                                        />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mb-1">
                                                            {activeConversation.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )
                                                )}
                                                
                                                <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isOutgoing ? 'items-end' : ''}`}>
                                                    <div className={`relative ${isOutgoing ? 'bg-primary text-white rounded-br-none' : `bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 rounded-bl-none text-slate-800 dark:text-slate-100 ${getSentimentBorderClass(msg.sentiment)}`} p-4 rounded-2xl shadow-soft`}>
                                                        <p className="text-base leading-relaxed">{msg.text}</p>
                                                        {msg.pending && (
                                                            <span className="absolute -bottom-1 -right-1 text-xs text-slate-400">
                                                                <span className="material-symbols-outlined text-sm animate-pulse">schedule</span>
                                                            </span>
                                                        )}
                                                        {/* TTS Button */}
                                                        <button 
                                                            onClick={() => speakMessage(msg.text)}
                                                            aria-label="Listen to message" 
                                                            className={`absolute ${isOutgoing ? '-left-10' : '-right-10'} top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-full ${speaking ? 'text-red-500' : 'text-primary'} hover:bg-slate-50 dark:hover:bg-slate-600`}
                                                        >
                                                            <span className="material-symbols-outlined text-lg">{speaking ? 'stop' : 'volume_up'}</span>
                                                        </button>
                                                    </div>
                                                    {/* Metadata Row */}
                                                    <div className={`flex items-center gap-2 ${isOutgoing ? 'pr-1' : 'pl-1'}`}>
                                                        <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                                                        {msg.sentiment && getSentimentBadge(msg.sentiment)}
                                                        {isOutgoing && msg.isRead && (
                                                            <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {isOutgoing && (
                                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
                                                        ME
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <footer className="p-4 md:p-6 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 z-20">
                            <div className="max-w-5xl mx-auto flex items-end gap-3">
                                {/* Action Tools */}
                                <div className="flex gap-2 pb-1">
                                    <button aria-label="Add Attachment" className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </button>
                                    <button 
                                        onClick={openCameraModal}
                                        aria-label="Visual AI Camera" 
                                        className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined">photo_camera</span>
                                    </button>
                                    <button aria-label="Emoji Picker" className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hidden md:flex items-center justify-center">
                                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                                    </button>
                                </div>
                                {/* Input Field Wrapper */}
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-md transition-all flex flex-col min-h-[56px]">
                                    <div className="flex items-center px-4 py-3 gap-2">
                                        <textarea 
                                            ref={textareaRef}
                                            className="bg-transparent border-none w-full resize-none p-0 focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-32 custom-scrollbar leading-relaxed" 
                                            placeholder="Type a message..." 
                                            rows="1"
                                            value={inputText}
                                            onChange={handleTextareaChange}
                                            onKeyPress={handleKeyPress}
                                        />
                                        {/* Speech-to-Text Button */}
                                        <button 
                                            onClick={toggleVoiceInput}
                                            aria-label="Use Speech to Text" 
                                            className={`transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-primary'}`}
                                        >
                                            <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic'}</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Send Button */}
                                <div className="flex gap-2 pb-1">
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!inputText.trim()}
                                        aria-label="Send Message" 
                                        className="h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>Send</span>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                    </button>
                                </div>
                            </div>
                            {/* Accessible Helper Text */}
                            <div className="max-w-5xl mx-auto mt-2 flex justify-between px-1">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    {isListening ? '🎤 Listening...' : 'Press Enter to send'}
                                </p>
                                <div className="flex gap-4">
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer hover:text-primary">
                                        <span className="material-symbols-outlined text-[12px]">keyboard</span>
                                        Shortcuts
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </>
                )}
            </main>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Chat</h2>
                            <button 
                                onClick={() => {
                                    setShowNewChatModal(false);
                                    setUserSearchQuery('');
                                    setUserSearchResults([]);
                                }}
                                className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="p-6 pb-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <span className="material-symbols-outlined">search</span>
                                </span>
                                <input 
                                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 text-base focus:ring-2 focus:ring-primary/50 transition-all dark:text-white placeholder:text-slate-400" 
                                    placeholder="Search users by name or email..." 
                                    type="text"
                                    value={userSearchQuery}
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                            {searchingUsers ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : userSearchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {userSearchResults.map((targetUser) => (
                                        <button
                                            key={targetUser.id}
                                            onClick={() => handleStartChat(targetUser)}
                                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                        >
                                            <div className="relative size-12 shrink-0">
                                                {targetUser.avatar ? (
                                                    <img 
                                                        alt={targetUser.display_name || targetUser.username} 
                                                        className="w-full h-full object-cover rounded-full" 
                                                        src={targetUser.avatar} 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                                        {(targetUser.display_name || targetUser.username)?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <span className={`absolute bottom-0 right-0 size-3 ${targetUser.is_online ? 'bg-green-500' : 'bg-slate-400'} border-2 border-white dark:border-surface-dark rounded-full`}></span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate">
                                                    {targetUser.display_name || targetUser.username}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                    @{targetUser.username}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary">chat</span>
                                        </button>
                                    ))}
                                </div>
                            ) : userSearchQuery.length >= 2 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">person_search</span>
                                    <p className="text-sm font-medium">No users found</p>
                                    <p className="text-xs">Try a different search term</p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">group_add</span>
                                    <p className="text-sm font-medium">Search for users</p>
                                    <p className="text-xs">Type at least 2 characters to search</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Modal for Visual AI */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">photo_camera</span>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Visual AI Analysis</h2>
                            </div>
                            <button 
                                onClick={closeCameraModal}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        {/* Camera/Image Preview */}
                        <div className="p-4">
                            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
                                {capturedImage ? (
                                    <img 
                                        src={capturedImage} 
                                        alt="Captured" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video 
                                        ref={localVideoRef}
                                        autoPlay 
                                        playsInline 
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Recording indicator */}
                                {!capturedImage && (
                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                                        Live
                                    </div>
                                )}
                            </div>

                            {/* Analysis Results */}
                            {visualAnalysis && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                                        Analysis Results
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Faces Detected:</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{visualAnalysis.face_count || 0}</span>
                                        </div>
                                        {visualAnalysis.privacy_alert && (
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg">
                                                <span className="material-symbols-outlined text-lg">warning</span>
                                                <span className="text-sm font-medium">Privacy Alert: Multiple faces detected!</span>
                                            </div>
                                        )}
                                        {visualAnalysis.message && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{visualAnalysis.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {visualAnalysis?.error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">error</span>
                                        <span className="text-sm font-medium">{visualAnalysis.error}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                            {!capturedImage ? (
                                <button
                                    onClick={capturePhoto}
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">camera</span>
                                    Capture Photo
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={retakePhoto}
                                        className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                        Retake
                                    </button>
                                    <button
                                        onClick={analyzeVisual}
                                        disabled={analyzingVisual}
                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {analyzingVisual ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">psychology</span>
                                                Analyze
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
