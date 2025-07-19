"use client";
import React, { useState, useEffect, useRef } from "react";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  shineColor = "#6CDAEC",
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
    shineColor?: string;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    TOP: `radial-gradient(25% 60% at 50% 0%, ${shineColor === "#6CDAEC" ? "hsl(0, 0%, 100%)" : "rgba(128, 128, 128, 0.8)"} 0%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.6)" : "rgba(128, 128, 128, 0.4)"} 50%, rgba(255, 255, 255, 0) 100%)`,
    LEFT: `radial-gradient(20% 50% at 0% 50%, ${shineColor === "#6CDAEC" ? "hsl(0, 0%, 100%)" : "rgba(128, 128, 128, 0.8)"} 0%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.6)" : "rgba(128, 128, 128, 0.4)"} 50%, rgba(255, 255, 255, 0) 100%)`,
    BOTTOM:
      `radial-gradient(25% 60% at 50% 100%, ${shineColor === "#6CDAEC" ? "hsl(0, 0%, 100%)" : "rgba(128, 128, 128, 0.8)"} 0%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.6)" : "rgba(128, 128, 128, 0.4)"} 50%, rgba(255, 255, 255, 0) 100%)`,
    RIGHT:
      `radial-gradient(20% 50% at 100% 50%, ${shineColor === "#6CDAEC" ? "hsl(0, 0%, 100%)" : "rgba(128, 128, 128, 0.8)"} 0%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.6)" : "rgba(128, 128, 128, 0.4)"} 50%, rgba(255, 255, 255, 0) 100%)`,
  };

  const highlight =
    `radial-gradient(75% 181.15942028985506% at 50% 50%, ${shineColor} 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0) 100%)`;

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return (
    <Tag
      onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-lg border-0 content-center bg-transparent transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-[1px] decoration-clone w-fit shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-shadow duration-300 m-2 group",
        containerClassName
      )}
      {...props}
    >
      <div
              className={cn(
        "w-auto z-10 px-4 py-2 rounded-[inherit] relative shadow-inner group-hover:shadow-[inset_0_1px_3px_rgba(108,218,236,0.3)]",
        className
      )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(0.5px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(0.3px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: `radial-gradient(15% 40% at 50% 50%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)` }}
        animate={{
          background: hovered
            ? [
                `radial-gradient(15% 40% at 50% 50%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)`,
                `radial-gradient(15% 40% at 80% 20%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)`,
                `radial-gradient(15% 40% at 20% 80%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)`,
                `radial-gradient(15% 40% at 50% 50%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)`
              ]
            : `radial-gradient(15% 40% at 50% 50%, ${shineColor === "#6CDAEC" ? "rgba(255, 255, 255, 0.9)" : "rgba(128, 128, 128, 0.7)"} 0%, rgba(255, 255, 255, 0) 100%)`,
        }}
        transition={{ ease: "linear", duration: (duration ?? 1) * 0.8 }}
      />
    </Tag>
  );
} 