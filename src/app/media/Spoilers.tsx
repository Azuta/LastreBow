// src/components/media/Spoiler.tsx
"use client";
import { useState } from 'react';

const Spoiler = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span
            onClick={() => setIsVisible(!isVisible)}
            className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors ${isVisible ? 'bg-gray-600 text-white' : 'bg-gray-800 text-transparent'}`}
        >
            {children}
        </span>
    );
};

export default Spoiler;