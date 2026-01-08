import { useChat } from '../../context/ChatContext';

export default function ChatList({ onSelect }) {
    const { conversations, activeConversation, setActiveConversation } = useChat();

    const handleSelect = (conv) => {
        setActiveConversation(conv);
        if (onSelect) onSelect();
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-2xl dark:text-white">Messages</h2>
            </div>

            <ul className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <li key={conv.id}>
                        <button
                            onClick={() => handleSelect(conv)}
                            className={`w-full p-4 flex items-center gap-4 transition text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary border-b border-gray-50 dark:border-gray-800 ${activeConversation?.id === conv.id
                                    ? 'bg-primary/5 dark:bg-primary/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            aria-current={activeConversation?.id === conv.id}
                        >
                            <div className="relative">
                                <img src={conv.avatar} alt="" className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                                {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{conv.name}</h3>
                                    {conv.unread > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{conv.unread}</span>}
                                </div>
                                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
