import { Play, Pause } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export default function MessageBubble({ message, isOwn }) {
    const { speak, cancel, speaking } = useTextToSpeech();

    const handlePlay = (e) => {
        e.stopPropagation();
        if (speaking) {
            cancel();
        } else {
            speak(message.text);
        }
    };

    return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4 group`}>
            <div
                className={`max-w-[70%] p-3 rounded-2xl relative ${isOwn
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-600'
                    }`}
                role="article"
                aria-label={`Message from ${isOwn ? 'you' : 'sender'}: ${message.text}`}
            >
                <p className="text-base leading-relaxed">{message.text}</p>

                {/* TTS Button */}
                <button
                    onClick={handlePlay}
                    className={`absolute ${isOwn ? '-left-10' : '-right-10'} top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-primary`}
                    aria-label="Read message aloud"
                >
                    {speaking ? <Pause size={16} className="text-primary" /> : <Play size={16} className="text-gray-500" />}
                </button>
            </div>

            <div className="flex gap-2 items-center mt-1 px-1">
                <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!isOwn && message.sentiment && (
                    <span className="text-xs" title={`Sentiment: ${message.sentiment}`}>
                        {message.sentiment === 'happy' ? '😊' : message.sentiment === 'sad' ? '😔' : ''}
                    </span>
                )}
            </div>
        </div>
    );
}
