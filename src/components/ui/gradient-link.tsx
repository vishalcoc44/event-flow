"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface GradientLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  isActive?: boolean;
}

export function GradientLink({ children, href, className, isActive }: GradientLinkProps) {
  return (
    <Link href={href}>
      <motion.div
        className={cn(
          "relative text-sm font-medium cursor-pointer",
          isActive ? "text-primary" : "text-gray-600 hover:text-gray-900",
          className
        )}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.15 }
        }}
      >
        {children}
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </Link>
  );
} 