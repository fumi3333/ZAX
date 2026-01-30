"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
    end: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

export default function CountUp({ end, duration = 2, suffix = "", className = "" }: CountUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20%" });
    const spring = useSpring(0, { duration: duration * 1000, stiffness: 50, damping: 20 });
    const display = useTransform(spring, (current) => current.toFixed(1));
    const [value, setValue] = useState("0");

    useEffect(() => {
        if (isInView) {
            spring.set(end);
        }
    }, [isInView, end, spring]);

    useEffect(() => {
        return display.on("change", (latest) => setValue(latest));
    }, [display]);

    return (
        <span ref={ref} className={className}>
            {value}{suffix}
        </span>
    );
}
