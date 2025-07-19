"use client";
import { useMotionValue } from "motion/react";
import React, { useState, useEffect } from "react";
import { useMotionTemplate, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const EvervaultCard = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    let str = generateRandomString(1500);
    setRandomString(str);
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    const str = generateRandomString(1500);
    setRandomString(str);
  }

  return (
    <div
      className={cn(
        "w-full h-full relative",
        className
      )}
    >
      <div
        onMouseMove={onMouseMove}
        className="group/card w-full h-full relative overflow-hidden bg-transparent"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
      </div>
    </div>
  );
};

export function CardPattern({ mouseX, mouseY, randomString }: any) {
  let maskImage = useMotionTemplate`radial-gradient(80px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm transition duration-500"
        style={style}
      />

    </div>
  );
}

const eventWords = [
  "EVENT", "CELEBRATION", "CONFERENCE", "SEMINAR", "WORKSHOP", "CONCERT", "WEDDING", "BIRTHDAY", "PARTY", "MEETING",
  "EXHIBITION", "TRADE_SHOW", "CONVENTION", "SYMPOSIUM", "SUMMIT", "FORUM", "NETWORKING", "LAUNCH", "GALA", "AWARDS",
  "FESTIVAL", "CARNIVAL", "FAIR", "EXPO", "SHOWCASE", "PRESENTATION", "DEMO", "WEBINAR", "TRAINING", "TEAM_BUILDING"
];

export const generateRandomString = (length: number) => {
  let result = "";
  const wordsNeeded = Math.ceil(length / 15); // Average word length is ~15 characters
  
  for (let i = 0; i < wordsNeeded; i++) {
    const randomWord = eventWords[Math.floor(Math.random() * eventWords.length)];
    result += randomWord + " ";
  }
  
  return result.slice(0, length);
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}; 