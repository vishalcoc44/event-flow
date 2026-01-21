"use client";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export const FeatureCard = ({ title, description, icon, className }: FeatureCardProps) => {
  return (
    <motion.div
      className={cn(
        "bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center group hover:shadow-lg transition-all duration-150",
        className
      )}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-16 h-16 bg-[#E8FBFD] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-150"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="text-primary group-hover:text-white transition-colors duration-150">
          {icon}
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-150">
        {title}
      </h3>
      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-150">
        {description}
      </p>
    </motion.div>
  );
}; 