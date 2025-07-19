"use client";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  position: string;
  className?: string;
}

export const TestimonialCard = ({ quote, author, position, className }: TestimonialCardProps) => {
  return (
    <motion.div
      className={cn(
        "bg-white p-6 rounded-lg shadow-sm border border-gray-100 group hover:shadow-lg transition-all duration-150",
        className
      )}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-150">
          "{quote}"
        </p>
        <div className="flex items-center">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full mr-3 group-hover:scale-110 transition-transform duration-150"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <div>
            <h4 className="font-semibold group-hover:text-primary transition-colors duration-150">
              {author}
            </h4>
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-150">
              {position}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 