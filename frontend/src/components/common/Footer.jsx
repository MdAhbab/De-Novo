import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-3xl text-primary">accessibility_new</span>
                            <span className="text-xl font-bold text-text-main dark:text-white">De-Novo</span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                            Building a world where communication has no physical limits.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-3">
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Features</Link></li>
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Safety</Link></li>
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Download</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main dark:text-white mb-4">Community</h4>
                        <ul className="space-y-3">
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Guidelines</Link></li>
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Blog</Link></li>
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Events</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main dark:text-white mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Help Center</Link></li>
                            <li><Link className="text-sm font-bold text-primary hover:underline" to="/accessibility">Accessibility Statement</Link></li>
                            <li><Link className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors" to="#">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-muted dark:text-gray-500">© 2026 De-Novo Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" to="#">
                            <span className="sr-only">Twitter</span>
                            <span className="material-symbols-outlined text-xl">share</span>
                        </Link>
                        <Link className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" to="#">
                            <span className="sr-only">Instagram</span>
                            <span className="material-symbols-outlined text-xl">photo_camera</span>
                        </Link>
                        <Link className="text-text-muted dark:text-gray-500 hover:text-primary transition-colors" to="#">
                            <span className="sr-only">LinkedIn</span>
                            <span className="material-symbols-outlined text-xl">work</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
