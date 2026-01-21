"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HoverShadowEffectProps {
  children: React.ReactNode;
  className?: string;
  shadowColor?: string;
  shadowIntensity?: number;
  shadowSize?: number;
  blurRadius?: number;
  spreadRadius?: number;
  transitionDuration?: number;
  hoverScale?: number;
  hoverLift?: number;
  disabled?: boolean;
}

export function HoverShadowEffect({
  children,
  className,
  shadowColor = "rgba(59,130,246,0.25)",
  shadowIntensity = 0.15,
  shadowSize = 40,
  blurRadius = 32,
  spreadRadius = 0,
  transitionDuration = 300,
  hoverScale = 1.02,
  hoverLift = -5,
  disabled = false,
}: HoverShadowEffectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
    }
  };

  const getShadowStyle = () => {
    if (!isHovered) {
      return {
        boxShadow: `0 8px ${blurRadius}px ${shadowColor.replace('0.25', shadowIntensity.toString())}, 0 16px ${blurRadius * 2}px rgba(0,0,0,0.1)`,
        transform: 'scale(1) translateY(0px)',
        transition: `all ${transitionDuration}ms ease-in-out`,
      };
    }
    
    return {
      boxShadow: `0 ${shadowSize}px ${blurRadius}px ${shadowColor}, 0 ${shadowSize * 2}px ${blurRadius * 2}px rgba(0,0,0,0.15)`,
      transform: `scale(${hoverScale}) translateY(${hoverLift}px)`,
      transition: `all ${transitionDuration}ms ease-in-out`,
    };
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        className
      )}
      style={getShadowStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// Predefined shadow themes
export const ShadowThemes = {
  blue: {
    shadowColor: "rgba(59,130,246,0.25)",
    shadowIntensity: 0.15,
  },
  purple: {
    shadowColor: "rgba(168,85,247,0.25)",
    shadowIntensity: 0.15,
  },
  green: {
    shadowColor: "rgba(34,197,94,0.25)",
    shadowIntensity: 0.15,
  },
  cyan: {
    shadowColor: "rgba(6,182,212,0.25)",
    shadowIntensity: 0.15,
  },
  red: {
    shadowColor: "rgba(239,68,68,0.25)",
    shadowIntensity: 0.15,
  },
  orange: {
    shadowColor: "rgba(249,115,22,0.25)",
    shadowIntensity: 0.15,
  },
  yellow: {
    shadowColor: "rgba(234,179,8,0.25)",
    shadowIntensity: 0.15,
  },
  pink: {
    shadowColor: "rgba(236,72,153,0.25)",
    shadowIntensity: 0.15,
  },
};

// Specialized components for different use cases
export function CardHoverShadow({
  children,
  theme = "blue",
  className,
  ...props
}: {
  children: React.ReactNode;
  theme?: keyof typeof ShadowThemes;
  className?: string;
} & Omit<HoverShadowEffectProps, 'shadowColor' | 'shadowIntensity'>) {
  const themeConfig = ShadowThemes[theme];
  
  return (
    <HoverShadowEffect
      className={cn(
        "bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer",
        className
      )}
      shadowColor={themeConfig.shadowColor}
      shadowIntensity={themeConfig.shadowIntensity}
      {...props}
    >
      {children}
    </HoverShadowEffect>
  );
}

export function ButtonHoverShadow({
  children,
  theme = "blue",
  className,
  ...props
}: {
  children: React.ReactNode;
  theme?: keyof typeof ShadowThemes;
  className?: string;
} & Omit<HoverShadowEffectProps, 'shadowColor' | 'shadowIntensity'>) {
  const themeConfig = ShadowThemes[theme];
  
  return (
    <HoverShadowEffect
      className={cn(
        "inline-block rounded-lg px-4 py-2 cursor-pointer",
        className
      )}
      shadowColor={themeConfig.shadowColor}
      shadowIntensity={themeConfig.shadowIntensity}
      hoverScale={1.05}
      hoverLift={-2}
      {...props}
    >
      {children}
    </HoverShadowEffect>
  );
}

export function ImageHoverShadow({
  children,
  theme = "blue",
  className,
  ...props
}: {
  children: React.ReactNode;
  theme?: keyof typeof ShadowThemes;
  className?: string;
} & Omit<HoverShadowEffectProps, 'shadowColor' | 'shadowIntensity'>) {
  const themeConfig = ShadowThemes[theme];
  
  return (
    <HoverShadowEffect
      className={cn(
        "rounded-xl overflow-hidden",
        className
      )}
      shadowColor={themeConfig.shadowColor}
      shadowIntensity={themeConfig.shadowIntensity}
      hoverScale={1.03}
      hoverLift={-3}
      {...props}
    >
      {children}
    </HoverShadowEffect>
  );
}

// Animated shadow effect with pulsing
export function AnimatedHoverShadow({
  children,
  className,
  pulseColor = "rgba(59,130,246,0.1)",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  pulseColor?: string;
} & Omit<HoverShadowEffectProps, 'shadowColor' | 'shadowIntensity'>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background shadow */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-all duration-500 ease-in-out",
          isHovered ? "animate-pulse" : ""
        )}
        style={{
          background: isHovered 
            ? `radial-gradient(circle at center, ${pulseColor} 0%, transparent 70%)`
            : "transparent",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          opacity: isHovered ? 0.8 : 0,
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 