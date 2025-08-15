"use client";

import { twMerge } from "tailwind-merge";
import { useAgent } from "./HeylockProvider";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function HeylockMessages({ className, userMessageClassName, assistantMessageClassName }) {
    const agent = useAgent();
    const [messages, setMessages] = useState([]);
    const containerRef = useRef(null);

    //#region Validate properties
    useEffect(() => {
        if (className !== undefined && typeof className !== "string") {
            throw new Error("HeylockMessages: 'className' must be a string if provided.");
        }

        if (userMessageClassName !== undefined && typeof userMessageClassName !== "string") {
            throw new Error("HeylockMessages: 'userMessageClassName' must be a string if provided.");
        }

        if (assistantMessageClassName !== undefined && typeof assistantMessageClassName !== "string") {
            throw new Error("HeylockMessages: 'assistantMessageClassName' must be a string if provided.");
        }
    }, [className, userMessageClassName, assistantMessageClassName]);
    //#endregion

    useEffect(() => {
        if(agent.isInitialized === true){
            setMessages(() => [...agent.messageHistory]);
        }

        // Define the callback outside to ensure referential stability
        const handleMessageHistoryChange = (messageHistory) => {
            setMessages(() => [...messageHistory]);

            //#region Manage container scroll
            if (containerRef.current) {
                try {
                    setTimeout(() => {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }, 0);
                } catch (error) {}
            }
            //#endregion
        };

        const unsubscribe = agent.onMessageHistoryChange(handleMessageHistoryChange);

        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, []);    

    return (
        <div 
            className={twMerge(
                "w-full h-full overflow-y-auto",
                className
            )} 
            ref={containerRef}
        >
            {
                messages.map((message, index) => {
                    return (
                        <motion.div 
                            key={'message-' + index} 
                            initial={{ opacity: 0, x: (message.role === "user" ? 5 : -5), scale: 0.9 }} 
                            animate={{ opacity: 1, x: 0, scale: 1 }} 
                            className={twMerge(
                                "px-4 py-3 rounded-2xl min-h-12 w-fit max-w-[31rem] mt-4 text-wrap",
                                message.role === "user" 
                                ? twMerge(" bg-gradient-to-t from-[#2F94FF] to-[#45ABFF] text-white ml-auto rounded-br-sm", userMessageClassName)
                                : twMerge(" bg-gradient-to-t from-[#FEFBEB] to-[#F3F3F3] text-black rounded-bl-sm", assistantMessageClassName)
                            )}
                        >
                            {
                                message.content.trim().length > 0 
                                ? parseHighlightedText(message.content)
                                : <TypingAnimation />
                            }

                        </motion.div>
                    )
                })
            }
        </div>
    );
}

function parseHighlightedText(content){
    const parts = content.split(/(\*\*[^*]+\*\*)/g);

    if (!content || content.trim() === "" || content.trim() === "**") return null;

    return parts.map((part, idx) => {
        if (typeof part !== "string") return null;

        // Check if part matches *text*
        const match = part.match(/^\*\*([^*]+)\*\*$/);

        if (match) {
            if (!match[1] || !match[1].trim()) return null;

            return (
                <span key={idx} className="font-medium">
                    {match[1]}
                </span>
            );
        }

        if (!part.trim()) return null;

        return <span key={idx}>{part}</span>;
    });
}

function TypingAnimation(){
    const containerVariants = {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.2,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.2
            }
        }
    }

    const dotVariants = {
        initial: { opacity: 0.2 },
        animate: {
            opacity: [0.2, 1, 0.2],
            y: [1, -3, 1],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    return (
        <div className="flex items-center space-x-1 px-2 py-2">
            <motion.div
                className="flex space-x-2"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    variants={dotVariants}
                />
                <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    variants={dotVariants}
                />
                <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    variants={dotVariants}
                />
            </motion.div>
        </div>
    )
}