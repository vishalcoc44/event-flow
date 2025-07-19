"use client";
import React from "react";
import { HoverBorderGradient } from "./hover-border-gradient";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "cta";
  shineColor?: string;
}

export function GradientButton({
  children,
  className,
  containerClassName,
  onClick,
  href,
  size = "md",
  variant = "primary",
  shineColor,
}: GradientButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "bg-white text-blue-600",
    cta: "bg-primary text-white",
  };

  const content = (
    <HoverBorderGradient
      containerClassName={cn(
        "rounded-lg",
        containerClassName
      )}
      as="button"
      className={cn(
        "flex items-center justify-center font-medium transition-all duration-150",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      duration={0.6}
      shineColor={shineColor}
    >
      {children}
    </HoverBorderGradient>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
} 