"use client";

import * as React from "react";
import HeylockInput from "./HeylockInput";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import HeylockMessages from "./HeylockMessages";

export default function HeylockExpandingChat({ className = "w-[calc(100vw-0.75rem)] sm:w-[24rem] fixed bottom-4 px-3 sm:right-4", messageContainerClassName = "h-96 max-h-[calc(100vh-8rem)]", headerClassName, disabled = false, closeButtonClassName, theme = 'auto', header = 'Chat with agent'}) {
    const [showMessages, setShowMessages] = React.useState(false); 

    React.useEffect(() => {
        // Validate 'className'
        if (className && typeof className !== 'string') {
            console.error("HeylockExpandingChat: 'className' prop must be a string.");
        }

        // Validate 'disabled'
        if (typeof disabled !== 'boolean') {
            console.error("HeylockExpandingChat: 'disabled' prop must be a boolean.");
        }

        // Validate 'theme'
        const validThemes = ['light', 'dark', 'auto'];
        if (!validThemes.includes(theme)) {
            console.error(`HeylockExpandingChat: 'theme' prop must be one of ${validThemes.join(', ')}.`);
        }

        // Validate 'messageContainerClassName'
        if (messageContainerClassName && typeof messageContainerClassName !== 'string') {
            console.error("HeylockExpandingChat: 'messageContainerClassName' prop must be a string.");
        }

        // Validate 'headerClassName'
        if (headerClassName && typeof headerClassName !== 'string') {
            console.error("HeylockExpandingChat: 'headerClassName' prop must be a string.");
        }

        // Validate 'closeButtonClassName'
        if (closeButtonClassName && typeof closeButtonClassName !== 'string') {
            console.error("HeylockExpandingChat: 'closeButtonClassName' prop must be a string.");
        }
        
        // Validate 'header'
        if (header && typeof header !== 'string') {
            console.error("HeylockExpandingChat: 'header' prop must be a string.");
        }
    }, [className, messageContainerClassName, headerClassName, disabled, closeButtonClassName, theme, header]);

    function handleClose() {
        setShowMessages(false);
    }

    function handleInputFocus(){
        setShowMessages(true);
    }

    return (
        <div className={className}>
            <AnimatePresence mode="wait">
                {
                    showMessages &&
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={twMerge(
                            "w-full h-94 bg-black/20 backdrop-blur-md border mb-6 rounded-2xl flex flex-col",
                            theme === 'dark' && "bg-[#0C0C0C]/80 border-[#242424]/90",
                            theme === 'light' && "bg-[#F8F8F8]/90 border-[#BEBEBE]/50",
                            theme === 'auto' && "bg-[#F8F8F8]/90 dark:bg-[#0C0C0C]/80 border-[#BEBEBE]/50 dark:border-[#242424]/90",
                            messageContainerClassName
                        )}
                    >
                        {/* Header */}
                        <div 
                            className={twMerge(
                                "w-full px-4 py-3 border-b flex justify-between items-center",
                                theme === 'dark' && "border-[#242424]/90",
                                theme === 'light' && "border-[#BEBEBE]/50",
                                theme === 'auto' && "border-[#BEBEBE]/50 dark:border-[#242424]/90",
                                headerClassName
                            )}
                        >
                            <span className="text-[#71707d] dark:text-white/50">{header}</span>
                            <button 
                                className={twMerge(
                                    "transition-all duration-150 rounded-sm p-0.5",
                                    theme === 'dark' && 'text-neutral-500 hover:text-white bg-transparent hover:bg-neutral-500/20',
                                    theme === 'light' && 'text-neutral-400 hover:text-[#242424] bg-transparent hover:bg-neutral-400/20',
                                    theme === 'auto' && 'text-neutral-400 dark:text-neutral-500 hover:text-[#242424] dark:hover:text-white bg-transparent hover:bg-neutral-400/20 dark:hover:bg-neutral-500/20',
                                    closeButtonClassName
                                )}
                                aria-label="Close chat"
                                type="button"
                                tabIndex={0}
                                onClick={handleClose}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <HeylockMessages className="px-2 pb-3"/>
                    </motion.div>
                }
            </AnimatePresence>

            <HeylockInput onFocus={handleInputFocus} disabled={disabled} theme={theme}/>
        </div>
    );
}
