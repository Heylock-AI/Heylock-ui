"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useAgent } from "./HeylockProvider";

const SUBMIT_THROTTLE_MS = 1000;
const MAX_INPUT_LENGTH = 20000;

export default function HeylockInput({ disabled = false, disabledText = "Unavaliable. Please try again later.", respondingText = "Responding...", theme = 'auto', placeholders=['Hi there', 'Hi here'], placeholderInterval = 5000, className, inputClassName, placeholderClassName, buttonClassName, arrowClassName, onChange, onSubmit, onFocus, }){
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const [isResponding, setIsResponding] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
    const canvasRef = useRef(null);
    const inputRef = useRef(null);
    const placeholderIntervalRef = useRef(null);
    const agent = useAgent();

    useEffect(() => {
        if(agent.isInitialized){
            setIsDisabled(agent.usageRemaining.messages <= 0);
        } else {
            const unsubscribe = agent.onInitialized((success) => {
                console.log(agent.usageRemaining);
                
                const hasReachedLimit = agent.usageRemaining.messages !== null && agent.usageRemaining.messages !== undefined && agent.usageRemaining.messages <= 0;

                if(success){
                    setIsDisabled(hasReachedLimit);
                } else {
                    setIsDisabled(true);
                }

                unsubscribe();
            });
        }
    }, []);

    useEffect(() => {
        if(disabled === false) return;

        setIsDisabled(disabled);
    }, [disabled]);

    //#region Placeholder animation
    useEffect(() => {
        placeholderIntervalRef.current = setInterval(() => {
            setCurrentPlaceholderIndex((prev) => (prev +1) % placeholders.length)
        }, placeholderInterval);

        return () => {
            clearInterval(placeholderIntervalRef.current);
        }
    }, []);
    //#endregion

    //#region Particles animation
    const animationDataRef = useRef([]);

    const animate = (start) => {
        const animateFrame = (pos = 0) => {
            requestAnimationFrame(() => {
            const newArr = [];

            for (let i = 0; i < animationDataRef.current.length; i++) {
                const current = animationDataRef.current[i];

                if (current.x < pos) {
                    newArr.push(current);
                } else {
                    if (current.r <= 0) {
                        current.r = 0;
                        continue;
                    }

                    current.x += Math.random() > 0.5 ? 1 : -1;
                    current.y += Math.random() > 0.5 ? 1 : -1;
                    current.r -= 0.05 * Math.random();

                    newArr.push(current);
                }
            }

            animationDataRef.current = newArr;

            const ctx = canvasRef.current?.getContext("2d");

            if (ctx) {
                ctx.clearRect(pos, 0, 800, 800);
                animationDataRef.current.forEach((t) => {
                const { x: n, y: i, r: s, color: color } = t;

                if (n > pos) {
                    ctx.beginPath();
                    ctx.rect(n, i, s, s);
                    ctx.fillStyle = color;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                });
            }

            if (animationDataRef.current.length > 0) {
                animateFrame(pos - 8);
            } else {
                setInputValue("");
                setIsAnimating(false);
            }
            });
        };

      animateFrame(start);
    };

    const draw = useCallback(() => {
        if (!inputRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 800;

        ctx.clearRect(0, 0, 800, 800);

        const computedStyles = getComputedStyle(inputRef.current);

        const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
        ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
        // Inherit input text color for particles
        ctx.fillStyle = computedStyles.getPropertyValue("text") || "#FFF";
        ctx.fillText(inputValue, 16, 40);

        const imageData = ctx.getImageData(0, 0, 800, 800);
        const pixelData = imageData.data;
        const newData = [];

        for (let t = 0; t < 800; t++) {
            let i = 4 * t * 800;

            for (let n = 0; n < 800; n++) {
                let e = i + 4 * n;

                if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
                    newData.push({
                        x: n,
                        y: t,
                        color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]],
                    });
                }
        }
        }

        animationDataRef.current = newData.map(({ x, y, color }) => ({
            x,
            y,
            r: 1,
            color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
        }));
    }, [inputValue]);
    //#endregion

    async function handleSubmit(event){
        event.preventDefault();

        //#region Validate
        // Throttle
        if(Date.now() - lastSubmitTime < SUBMIT_THROTTLE_MS) return;

        setLastSubmitTime(Date.now());

        // Not empty and not too long
        if(!inputValue.trim() || inputValue.length > MAX_INPUT_LENGTH) return;

        if(!agent.isInitialized) return;

        // Limits are not met
        if(agent.usageRemaining.messages !== null && agent.usageRemaining.messages !== undefined && agent.usageRemaining.messages <= 0){
            setIsDisabled(true);
            return;
        }

        // Not busy
        if(isDisabled || isAnimating || isResponding) return;
        //#endregion

        onSubmit && onSubmit(event);

        setIsAnimating(true);
        draw();

        if(inputRef.current){
            const maxX = animationDataRef.current.reduce((prev, current) => (current.x > prev ? current.x : prev), 0);

            animate(maxX);
        }

        setIsResponding(true);

        for await (const chunk of agent.messageStream(inputValue)){}

        setIsResponding(false);

        // Check limits
        if(agent.usageRemaining.messages !== null && agent.usageRemaining.messages !== undefined && agent.usageRemaining.messages <= 0){
            setIsDisabled(true);
        }
    }
    
    function handleInputChange(event){
        if(!isAnimating && !isDisabled){
            setInputValue(event.target.value);
            onChange && onChange(event);
        }   
    }

    return (
        <form
            className={twMerge(
                "w-full relative mx-auto backdrop-blur-md border h-12 rounded-full overflow-hidden transition duration-200",
                theme === 'dark' && "bg-[#0C0C0C]/80 border-[#242424]/90",
                theme === 'light' && "bg-[#F8F8F8]/90 border-[#BEBEBE]/50",
                theme === 'auto' && "bg-[#F8F8F8]/90 dark:bg-[#0C0C0C]/80 border-[#BEBEBE]/50 dark:border-[#242424]/90",
                className,
                isDisabled && "cursor-not-allowed opacity-50"
            )}
            onSubmit={handleSubmit}
            onFocus={onFocus}
        >
            {/* Visually hidden label for accessibility */}
            <label htmlFor="heylock-chat-input" className="sr-only">Chat message input</label>

            {/* Canvas for particle animation (decorative only) */}
            <canvas 
                aria-hidden="true"
                className={twMerge(
                    "absolute pointer-events-none  text-base transform scale-50 top-[20%] left-2 origin-top-left filter invert dark:invert-0 pr-20",
                    isAnimating ? "opacity-100" : "opacity-0"
                )}
                ref={canvasRef}
            />

            {/* Placeholders */}
            <div aria-live="polite" className="absolute inset-0 flex items-center rounded-full pointer-events-none" >
                <AnimatePresence mode="wait">
                    {
                        !inputValue && (
                            <motion.p
                                initial={{
                                    y: 5,
                                    opacity: 0,
                                }}
                                key={`current-placeholder-${currentPlaceholderIndex}`}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                }}
                                exit={{
                                    y: -10,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: "linear",
                                }}
                                className={twMerge(
                                    "text-base font-normal pl-4 text-left w-[calc(100%-2rem)] truncate",
                                    theme === "dark" && "text-white/50",
                                    theme === "light" && "text-[#6E6D84]",
                                    theme === "auto" && "text-[#6E6D84] dark:text-white/50",
                                    placeholderClassName
                                )}
                            >
                                {isDisabled
                                    ? disabledText
                                    : isResponding
                                        ? respondingText
                                        : placeholders[currentPlaceholderIndex]
                                }
                            </motion.p>
                        )
                    }
                </AnimatePresence>
            </div>

            <input
                onChange={handleInputChange}
                ref={inputRef}
                value={inputValue}
                type="text"
                disabled={isDisabled}
                className={twMerge(
                    "w-full relative text-base z-50 bg-transparent h-full rounded-full pl-4 pr-20",
                    theme === 'dark' && "text-white",
                    theme === 'light' && "text-[#242424]",
                    theme === 'auto' && "text-[#242424] dark:text-white",
                    inputClassName,
                    isAnimating && "text-transparent dark:text-transparent",
                    isDisabled && "cursor-not-allowed opacity-50",
                )}
            />

            {/* Submit button */}
            <button
                aria-label="Send message"
                aria-disabled={!inputValue || isDisabled}
                disabled={!inputValue || isDisabled}
                type="submit"
                className={twMerge(
                    "absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-transparent transition duration-200 flex items-center justify-center cursor-pointer disabled:cursor-auto",
                    theme === "dark" && "bg-[#242424]",
                    theme === "light" && "bg-[#BEBEBE]/50",
                    theme === "auto" && "bg-[#BEBEBE]/50 dark:bg-[#242424]",
                    buttonClassName
                )}
            >
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={twMerge(
                        'h-4 w-4',
                        theme === "dark" && "text-gray-300",
                        theme === "light" && "text-[#6e6e6e]",
                        theme === "auto" && "text-[#242424] dark:text-white",
                        arrowClassName
                    )}
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <motion.path
                        d="M5 12l14 0"
                        initial={{
                            strokeDasharray: "50%",
                            strokeDashoffset: "50%",
                        }}
                        animate={{
                            strokeDashoffset: inputValue ? 0 : "50%",
                            opacity: inputValue.length > 0 ? 1 : 0.4,
                        }}
                        transition={{
                            duration: 0.3,
                            ease: "linear",
                        }}
                    />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                </motion.svg>
            </button>
        </form>
    );
}