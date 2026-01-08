import React from 'react';
import { Link } from 'react-router-dom';

const ChatPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main h-screen overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar / Contacts List */}
            <aside className="w-full md:w-[380px] h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark z-20 shadow-soft md:shadow-none">
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
                    <button className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
                {/* Search */}
                <div className="px-6 pb-4">
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 text-base focus:ring-2 focus:ring-primary/50 transition-all dark:text-white placeholder:text-slate-400" placeholder="Search contacts..." type="text" />
                    </div>
                </div>
                {/* Tags/Filters */}
                <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                    <button className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">All Chats</button>
                    <button className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Unread</button>
                    <button className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Favorites</button>
                </div>
                {/* Contact List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
                    {/* Active Contact */}
                    <div className="group flex items-center gap-4 p-3 rounded-xl bg-primary/10 border border-primary/20 cursor-pointer relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                        <div className="relative size-12 shrink-0">
                            <img alt="Sarah Jenkins portrait" className="w-full h-full object-cover rounded-full" data-alt="Portrait of Sarah Jenkins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTWOmb6nIWw_9ZL-5-9Y_zCzNUNWltG0fKqS_HIfNlJ6tnheg5ErkU7kD_-LPM16lCuw1PamffB76wrn_TcW_oqKuMCBcmvjmpt5mNj4xlvLNdB_czib-EtbEBq1RD6woZnagcqcUZQP4WifVEaLQg8W6rIhGnrFEUeX-NoVopoj3b4SnLdNqTcS44g2HG22baoh2l7Xz0APF63tFubW-7ZLcTq-HLI_sRMMBGTtkEP1bHSxhodSeJa62wud6HzAXCfgv58Bbau7s" />
                            <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate">Sarah Jenkins</h3>
                                <span className="text-xs font-semibold text-primary">Now</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-primary font-medium truncate">Typing...</p>
                                <span className="size-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">2</span>
                            </div>
                        </div>
                    </div>
                    {/* Contact Item */}
                    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent">
                        <div className="relative size-12 shrink-0">
                            <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg">SB</div>
                            <span className="absolute bottom-0 right-0 size-3 bg-slate-400 border-2 border-white dark:border-surface-dark rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">Support Bot</h3>
                                <span className="text-xs text-slate-400">2m</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">How can I help you today?</p>
                        </div>
                    </div>
                    {/* Contact Item */}
                    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent">
                        <div className="relative size-12 shrink-0">
                            <img alt="David Chen portrait" className="w-full h-full object-cover rounded-full" data-alt="Portrait of David Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI2Yqsrb61EORCyiXnojbLSI-ym_VwUBjgabvm8h6nslJLonOeYtMpQaNAblwzEUAEX0KoEmvvjDLSxvSFiZQZnT-QSOECPOT0oPEtRdCS94H44JlHdLoRACr5wwnFqzs1oxq17_R4mHMb0WVYdhsPFS28MRWIUkcaF4PRgtJ9BmeudHHvXFHFV9Pv50fRvTqIaLFQeVOOXnxZbIslPfbm8mfURI_EX4GalIvFqpFncVdeq2-hAz-8Jn6BxhxKYmPK4pePDffa-Ug" />
                            <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">David Chen</h3>
                                <span className="text-xs text-slate-400">1h</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">graphic_eq</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Voice message (0:45)</p>
                            </div>
                        </div>
                    </div>
                    {/* Contact Item */}
                    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent">
                        <div className="relative size-12 shrink-0">
                            <img alt="Maria Garcia portrait" className="w-full h-full object-cover rounded-full" data-alt="Portrait of Maria Garcia" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4GVcZOYEoMICgdTrTticF4SUbFWB3y2uKMhlPIVbd8GP_uBHNN2K_zXF1Tkq2Jh5YBGy5PGqrnmseoFyObpYjrUwrzbnEvs53QnRmlt8y6xtfhvJgB0j0Ynu-VKDca0XjPycpGkct_Q7FWkAtYa0aAtYoYFSyfs71GyjVvCb9kvt2CWJLGyGP_h1CC41tl_67Xc1RQN9Vd4Oql-4IPIT58qzBF5u4WwKOSYVLLdn4ZUP_jkyt4gTDqIeyU90JsJzXZRyU8X5PuqU" />
                            <span className="absolute bottom-0 right-0 size-3 bg-slate-400 border-2 border-white dark:border-surface-dark rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">Maria Garcia</h3>
                                <span className="text-xs text-slate-400">Yesterday</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Thanks for the update!</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full relative bg-background-light dark:bg-background-dark">
                {/* Chat Header */}
                <header className="h-[72px] px-6 flex items-center justify-between bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden">
                            <Link to="/dashboard" className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                        </div>
                        <div className="relative">
                            <img alt="Sarah Jenkins" className="size-10 rounded-full object-cover" data-alt="Sarah Jenkins Header Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDnhzYqVFcLjNgrUhceiU8VqscRDQG9PDZHr2XJDO-RFSd8Gn915VnAbShEflAj6cG0AYx_lIsRPNGP_X72Snq2hryPQ39gzo8srCXeqo8L2fpMRfKIDPUfWATtv_gV6WsOnpT7QzCebt7ayHNU8t00-CgsxqC3di_Gs48OIB3t9MtT6Jy1peKCmY2OZA-dc9UUMzAxjcHpT7_NSc4F3PSQH6hzBPO9tzRJx1xMuoPTwlVkOfx5umkBuHYn3pxRdh9V8K2udLPlJI" />
                            <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Sarah Jenkins</h2>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full px-1.5 py-0.5">
                                    <span className="material-symbols-outlined text-[10px] text-primary mr-1">verified_user</span>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">E2E Encrypted</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
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

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM5NGEzYjgiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')" }}>
                    <div className="flex justify-center">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Today</span>
                    </div>

                    {/* Incoming Message (Text) */}
                    <div className="flex items-end gap-3 group/msg">
                        <img alt="Sarah Avatar" className="size-8 rounded-full object-cover mb-1" data-alt="Sarah Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpmtYuF8xY1432gQIawKPU5sumOjNuUyZzNwdj7ILqRA3-zNGMfIZFvAaP1a3bUjRDqyGzU190BxhRMk71GGySyAwKRj9UOwgwUK4ZyAYWYuoVzyBwhIvF5HekERJ3PITRDsY6EoFpKPlat8McpAyG1_mPKOBVE-vclLAL16sHd6YU-FLNwUFhCcG_g45dduYgOypuYxxvZffVFOI4B8Ds1RpNA4mSrtwQYBnUY5_MXCqVShiQrTIZW8jgzy7Wbs4DnojUWIqd7M0" />
                        <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%]">
                            <div className="flex items-end gap-2">
                                <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-soft text-slate-800 dark:text-slate-100 relative">
                                    <p className="text-base leading-relaxed">Hi! Are we still meeting for the project review later?</p>
                                    {/* TTS Button */}
                                    <button aria-label="Listen to message" className="absolute -right-10 top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-full text-primary hover:bg-slate-50 dark:hover:bg-slate-600">
                                        <span className="material-symbols-outlined text-lg">volume_up</span>
                                    </button>
                                </div>
                            </div>
                            {/* Metadata Row */}
                            <div className="flex items-center gap-2 pl-1">
                                <span className="text-xs text-slate-400">10:42 AM</span>
                                {/* Sentiment Indicator */}
                                <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                    <span className="material-symbols-outlined text-[12px]">sentiment_neutral</span>
                                    <span>Neutral</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Outgoing Message (Text) */}
                    <div className="flex items-end gap-3 justify-end group/msg">
                        <div className="flex flex-col gap-1 items-end max-w-[85%] md:max-w-[70%]">
                            <div className="bg-primary text-white p-4 rounded-2xl rounded-br-none shadow-md relative">
                                <p className="text-base leading-relaxed">Yes, absolutely. I'll be there at 2 PM.</p>
                                {/* TTS Button */}
                                <button aria-label="Listen to message" className="absolute -left-10 top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-full text-slate-600 dark:text-slate-300 hover:text-primary">
                                    <span className="material-symbols-outlined text-lg">volume_up</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-1 pr-1">
                                <span className="text-xs text-slate-400 dark:text-slate-500">10:43 AM</span>
                                <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                            </div>
                        </div>
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">ME</div>
                    </div>

                    {/* Incoming Message (Voice) */}
                    <div className="flex items-end gap-3 group/msg">
                        <img alt="Sarah Avatar" className="size-8 rounded-full object-cover mb-1" data-alt="Sarah Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLLvi_bBRwhqXjHQ0A7X4NGmCNYuQhVivNM5tXVG6uE7j8PIyzfLipgmG0BpEA2R1Z49OwEQ6aLAATyjEUanv9DZnm3vtZVU7nGbe8kahJYqdoNcu8RSa47zGssj_byL92GXd53lDJCQkT1-k4m4GvltdHjF_hMBsTpF5Yxyc5yzadDsv1S_8bl9v0paPprVT3vQvYsezQw00AcAHjhrQltln0GxWHjW-oqb5Uh9OKPKWmUW9eLhee7hMatqkVhCLp6Z6UVsQjAys" />
                        <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%]">
                            <div className="flex items-end gap-2">
                                <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-bl-none shadow-soft text-slate-800 dark:text-slate-100 flex items-center gap-3 w-64">
                                    <button className="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-sm shrink-0">
                                        <span className="material-symbols-outlined fill-current">play_arrow</span>
                                    </button>
                                    <div className="flex-1 flex flex-col justify-center gap-1">
                                        {/* Waveform Visual */}
                                        <div aria-hidden="true" className="flex items-center gap-[2px] h-6 w-full overflow-hidden">
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-2"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-4"></div>
                                            <div className="w-1 bg-primary rounded-full h-6"></div>
                                            <div className="w-1 bg-primary rounded-full h-3"></div>
                                            <div className="w-1 bg-primary rounded-full h-5"></div>
                                            <div className="w-1 bg-primary rounded-full h-2"></div>
                                            <div className="w-1 bg-primary rounded-full h-4"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-2"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-3"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-1"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-2"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-4"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-2"></div>
                                            <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full h-3"></div>
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">0:15</span>
                                    </div>
                                </div>
                            </div>
                            {/* Metadata Row */}
                            <div className="flex items-center gap-2 pl-1">
                                <span className="text-xs text-slate-400">10:45 AM</span>
                                {/* Sentiment Indicator */}
                                <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                    <span className="material-symbols-outlined text-[12px]">sentiment_satisfied</span>
                                    <span>Happy</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex items-end gap-3">
                        <img alt="Sarah Avatar" className="size-8 rounded-full object-cover mb-1" data-alt="Sarah Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIooEoiCsDvANPv0B2lVPXnI5Uj1ePbCvBbD_7fP7jhkVhZ4RBKurKA1ZwI099EJul7fNoTdwz1FuJcWOYqyzhgqVf8IFXTQqAP7uvNPk9H3aT5U0zIDIXMNIA_EAGklbQzh-d2hKsCKbE9V3NDfgm60Ey9IaBP5PFSCWzQaJ01AtNvfQeU7byYxgh8v4QUCTjWw7VMvsogfSnmpxMHOVwq3oaoa5tdSy92O8Olsq7IPAysO5Y_UA-ywR9hW-_2NafUmDDdoRih6I" />
                        <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-soft w-fit">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <footer className="p-4 md:p-6 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 z-20">
                    <div className="max-w-5xl mx-auto flex items-end gap-3">
                        {/* Action Tools */}
                        <div className="flex gap-2 pb-1">
                            <button aria-label="Add Attachment" className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                            <button aria-label="Emoji Picker" className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center hidden md:flex">
                                <span className="material-symbols-outlined">sentiment_satisfied</span>
                            </button>
                        </div>
                        {/* Input Field Wrapper */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-md transition-all flex flex-col min-h-[56px]">
                            <div className="flex items-center px-4 py-3 gap-2">
                                <textarea className="bg-transparent border-none w-full resize-none p-0 focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-32 custom-scrollbar leading-relaxed" placeholder="Type a message..." rows="1"></textarea>
                                {/* Speech-to-Text Button */}
                                <button aria-label="Use Speech to Text" className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">mic</span>
                                </button>
                            </div>
                        </div>
                        {/* Record / Send Area */}
                        <div className="flex gap-2 pb-1">
                            <button aria-label="Hold to Record Voice Message" className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center relative group">
                                <span className="material-symbols-outlined">mic_none</span>
                                <span className="absolute -top-10 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Hold to record</span>
                            </button>
                            <button aria-label="Send Message" className="h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                                <span>Send</span>
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>
                    {/* Accessible Helper Text */}
                    <div className="max-w-5xl mx-auto mt-2 flex justify-between px-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Press Enter to send</p>
                        <div className="flex gap-4">
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer hover:text-primary">
                                <span className="material-symbols-outlined text-[12px]">keyboard</span>
                                Shortcuts
                            </p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ChatPage;
