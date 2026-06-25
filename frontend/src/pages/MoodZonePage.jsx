import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import Avatar from '../components/common/Avatar';

// Align with backend MOOD_CHOICES where possible
const MOODS = [
    { id: 'very_happy', icon: 'sentiment_very_satisfied', label: 'Great', color: 'green' },
    { id: 'happy', icon: 'sentiment_satisfied', label: 'Good', color: 'green' },
    { id: 'neutral', icon: 'sentiment_neutral', label: 'Okay', color: 'slate' },
    { id: 'anxious', icon: 'sentiment_worried', label: 'Anxious', color: 'amber' },
    { id: 'tired', icon: 'bedtime', label: 'Tired', color: 'purple' },
    { id: 'frustrated', icon: 'mood_bad', label: 'Frustrated', color: 'red' },
    { id: 'calm', icon: 'self_improvement', label: 'Calm', color: 'blue' },
    { id: 'sad', icon: 'sentiment_dissatisfied', label: 'Sad', color: 'blue' }
];

const SOUND_CATEGORIES = ['Nature', 'Music', 'White Noise', 'Meditation'];

const MoodZonePage = () => {
    const { user, getUserDisplayName } = useAuth();
    const displayName = getUserDisplayName();

    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState('');
    const [sounds, setSounds] = useState([]);
    const [recommendedSounds, setRecommendedSounds] = useState([]);
    const [currentSound, setCurrentSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Nature');
    const [moodHistory, setMoodHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    
    const audioRef = useRef(null);
    const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechToText();

    useEffect(() => {
        fetchSounds();
        fetchMoodHistory();
    }, []);

    useEffect(() => {
        if (transcript) {
            setNotes(prev => (prev ? prev + ' ' : '') + transcript);
            clearTranscript();
        }
    }, [transcript, clearTranscript]);

    useEffect(() => {
        if (selectedMood) {
            fetchRecommendedSounds(selectedMood);
        }
    }, [selectedMood]);

    // Audio Player effect
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying && currentSound) {
                audioRef.current.play().catch(e => {
                    console.error("Audio playback failed", e);
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSound]);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (timeRemaining !== null && timeRemaining > 0 && isPlaying) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsPlaying(false);
            setTimeRemaining(null);
        }
        return () => clearInterval(interval);
    }, [timeRemaining, isPlaying]);

    const formatTime = (seconds) => {
        if (seconds === null) return null;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSetTimer = (minutes) => {
        setTimeRemaining(minutes * 60);
    };

    const fetchSounds = async () => {
        try {
            const res = await api.mood.getSounds();
            if (res.success && Array.isArray(res.data)) {
                setSounds(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch sounds:', err);
        }
    };

    const fetchMoodHistory = async () => {
        try {
            const res = await api.mood.getMoodHistory(7);
            if (res.success && Array.isArray(res.data)) {
                setMoodHistory(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch mood history:', err);
        }
    };

    const fetchRecommendedSounds = async (mood) => {
        try {
            const res = await api.mood.getRecommendedSounds(mood);
            if (res.success && Array.isArray(res.data)) {
                setRecommendedSounds(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch recommended sounds:', err);
        }
    };

    const handleLogMood = async () => {
        if (!selectedMood) return;
        setLoading(true);
        try {
            const res = await api.mood.logMood(selectedMood, notes);
            if (res.success) {
                setNotes('');
                setSelectedMood(null);
                fetchMoodHistory();
            } else {
                alert(res.error?.message || 'Failed to log mood');
            }
        } catch (err) {
            alert('Failed to log mood.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySound = (sound) => {
        if (currentSound?.id === sound.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentSound(sound);
            setIsPlaying(true);
        }
    };

    const getMoodDetails = (moodId) => {
        return MOODS.find(m => m.id === moodId) || MOODS[2]; // Default to neutral
    };

    const filteredSounds = sounds.filter(s => 
        s.category?.toLowerCase() === activeCategory.toLowerCase().replace(' ', '_')
    );

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            {/* Audio Element */}
            <audio ref={audioRef} src={currentSound?.file_url} loop />

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined" aria-hidden="true">psychology_alt</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">De-Novo <span className="text-primary font-normal text-sm ml-1">Mood Zone</span></h1>
                        </Link>
                        <nav className="hidden md:flex gap-8">
                            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Home</Link>
                            <Link to="/chat" className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Messages</Link>
                            <Link to="/mood-zone" aria-current="page" className="text-sm font-medium text-primary font-bold">Mood Zone</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link to="/profile">
                                <Avatar src={user?.avatar} name={displayName} username={user?.username} userId={user?.id} size="size-9" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left Column: Check-in & Input */}
                    <section aria-labelledby="check-in-heading" className="lg:col-span-3 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold mb-1" id="check-in-heading">Check-in</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-500 mb-6">How are you feeling right now?</p>
                            
                            {/* Mood Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {MOODS.map((mood) => {
                                    const isSelected = selectedMood === mood.id;
                                    return (
                                        <button 
                                            key={mood.id}
                                            onClick={() => setSelectedMood(mood.id)}
                                            className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-${mood.color}-500 ${isSelected ? `bg-${mood.color}-100 dark:bg-${mood.color}-900/40 border-${mood.color}-400 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900` : `bg-slate-50 dark:bg-gray-800 border-transparent hover:bg-slate-100 dark:hover:bg-gray-700`} border`}
                                        >
                                            <span className={`material-symbols-outlined text-3xl mb-2 icon-filled ${isSelected ? `text-${mood.color}-600 dark:text-${mood.color}-400` : 'text-slate-500 dark:text-gray-500'}`} aria-hidden="true">{mood.icon}</span>
                                            <span className={`text-xs font-semibold ${isSelected ? `text-${mood.color}-700 dark:text-${mood.color}-300` : 'text-slate-600 dark:text-gray-500'}`}>{mood.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Notes Input */}
                            {selectedMood && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Add notes (optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="How are you feeling? What's on your mind?"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                </div>
                            )}
                            
                            {/* Log Mood Button */}
                            {selectedMood && (
                                <button 
                                    onClick={handleLogMood}
                                    disabled={loading}
                                    className="w-full mb-4 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Logging...' : 'Log My Mood'}
                                </button>
                            )}
                            
                            {/* Voice Input */}
                            <div className="pt-4 border-t border-slate-100 dark:border-gray-800">
                                <button 
                                    onClick={isListening ? stopListening : startListening}
                                    className={`w-full flex items-center justify-center gap-3 ${isListening ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700'} hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-900 dark:text-white p-4 rounded-xl border transition-colors group`}
                                >
                                    <div className={`${isListening ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : 'bg-primary/10 dark:bg-primary/20'} p-2 rounded-full group-hover:scale-110 transition-transform`}>
                                        <span className={`material-symbols-outlined ${isListening ? 'text-red-500' : 'text-primary'}`} aria-hidden="true">mic</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold">{isListening ? 'Listening...' : 'Voice Input'}</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-500">{isListening ? 'Tap to stop' : 'Record your thoughts'}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Center Column: Sensory Experience */}
                    <section aria-labelledby="experience-heading" className="lg:col-span-6 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-gray-800 h-full flex flex-col">
                            {/* Tabs */}
                            <div className="p-4 flex gap-2 overflow-x-auto">
                                {SOUND_CATEGORIES.map((category) => (
                                    <button 
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                                            activeCategory === category 
                                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                                : 'bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Available Sounds List for the category (if no sound playing) */}
                            {!currentSound && (
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                                    {filteredSounds.map(sound => (
                                        <button 
                                            key={sound.id}
                                            onClick={() => handlePlaySound(sound)}
                                            className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-primary transition-colors text-left"
                                        >
                                            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-gray-700 bg-cover bg-center shrink-0" style={{ backgroundImage: sound.thumbnail_url ? `url(${sound.thumbnail_url})` : 'none' }}>
                                                {!sound.thumbnail_url && <span className="material-symbols-outlined flex items-center justify-center h-full w-full text-slate-500" aria-hidden="true">music_note</span>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sound.name}</h4>
                                                <p className="text-xs text-slate-500">{Math.floor(sound.duration / 60)} min</p>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredSounds.length === 0 && (
                                        <div className="col-span-2 text-center text-slate-500 py-10">
                                            No sounds found for this category.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Visualizer Area (if sound playing) */}
                            {currentSound && (
                                <>
                                    <div className="relative flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl m-2 min-h-[300px] flex items-center justify-center overflow-hidden border border-slate-100 dark:border-gray-700">
                                        {/* Background Image Layer */}
                                        <div
                                            className="absolute inset-0 opacity-10 dark:opacity-20 bg-cover bg-center"
                                            style={{ backgroundImage: currentSound.thumbnail_url ? `url('${currentSound.thumbnail_url}')` : 'none' }}
                                        ></div>
                                        
                                        {/* Sound Wave Animation (CSS) */}
                                        <div aria-label="Visual representation of sound waves playing" className="relative z-10 flex items-center justify-center gap-2 h-32 w-full max-w-md px-10">
                                            {isPlaying ? (
                                                <>
                                                    <div className="w-3 bg-primary rounded-full h-full animate-wave-1"></div>
                                                    <div className="w-3 bg-primary/80 rounded-full h-full animate-wave-2"></div>
                                                    <div className="w-3 bg-primary/60 rounded-full h-full animate-wave-3"></div>
                                                    <div className="w-3 bg-primary/40 rounded-full h-full animate-wave-4"></div>
                                                    <div className="w-3 bg-primary/80 rounded-full h-full animate-wave-5"></div>
                                                    <div className="w-3 bg-primary/60 rounded-full h-full animate-wave-2"></div>
                                                    <div className="w-3 bg-primary rounded-full h-full animate-wave-1"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-2 bg-primary/20 rounded-full"></div>
                                            )}
                                        </div>
                                        
                                        {/* Track Info Overlay */}
                                        <div className="absolute bottom-6 left-6 z-20">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-12 w-12 rounded-lg bg-cover bg-center shadow-lg bg-slate-200 dark:bg-gray-700"
                                                    style={{ backgroundImage: currentSound.thumbnail_url ? `url('${currentSound.thumbnail_url}')` : 'none' }}
                                                ></div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{currentSound.name}</h3>
                                                    <p className="text-sm text-primary font-medium">{currentSound.category} • {Math.floor(currentSound.duration / 60)} min</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Timer Badge */}
                                        {timeRemaining !== null && (
                                            <div className="absolute top-6 right-6 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-600 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-primary text-sm" aria-hidden="true">timer</span>
                                                <span className="text-sm font-bold font-mono">{formatTime(timeRemaining)}</span>
                                            </div>
                                        )}
                                        <button onClick={() => setCurrentSound(null)} className="absolute top-6 left-6 z-20 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition">
                                            <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                                        </button>
                                    </div>
                                    
                                    {/* Player Controls */}
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                            {/* Main Playback */}
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => handlePlaySound(currentSound)} aria-label={isPlaying ? 'Pause' : 'Play'} className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl icon-filled" aria-hidden="true">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                                </button>
                                            </div>
                                            {/* Timer & Volume */}
                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
                                                <div className="flex bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
                                                    <button onClick={() => handleSetTimer(5)} className="px-3 py-1.5 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-300">5m</button>
                                                    <button onClick={() => handleSetTimer(15)} className="px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-300">15m</button>
                                                    <button onClick={() => handleSetTimer(30)} className="px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-300">30m</button>
                                                    {timeRemaining !== null && (
                                                        <button onClick={() => handleSetTimer(0)} className="px-3 py-1.5 text-xs font-medium rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Clear</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Reflection & Recs */}
                    <section aria-labelledby="history-heading" className="lg:col-span-3 flex flex-col gap-6">
                        {/* History List */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-800 flex-1 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg" id="history-heading">Journal</h3>
                            </div>
                            <div className="space-y-4">
                                {moodHistory.length === 0 ? (
                                    <p className="text-slate-500 dark:text-gray-500 text-sm">No recent entries.</p>
                                ) : (
                                    moodHistory.slice(0, 8).map(entry => {
                                        const moodObj = getMoodDetails(entry.mood);
                                        const date = new Date(entry.created_at);
                                        return (
                                            <div key={entry.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 pb-2 last:pb-0">
                                                <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-${moodObj.color}-500`}></div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">{date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 capitalize">{entry.mood.replace('_', ' ')}</p>
                                                        {entry.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{entry.notes}</p>}
                                                    </div>
                                                    <span className={`material-symbols-outlined text-${moodObj.color}-500 text-lg icon-filled`} aria-hidden="true">{moodObj.icon}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MoodZonePage;
