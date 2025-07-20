"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { cn } from "@/lib/utils";

interface Dashboard3DCardProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  value?: string | number;
  description?: string;
  onClick?: () => void;
}

export function Dashboard3DCard({
  children,
  className,
  containerClassName,
  title,
  subtitle,
  icon,
  value,
  description,
  onClick,
}: Dashboard3DCardProps) {
  return (
    <CardContainer 
      className={cn("w-full h-full", containerClassName)}
    >
      <CardBody 
        className={cn(
          "bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {title && (
          <CardItem
            translateZ="30"
            className="text-sm font-medium text-gray-500 mb-2"
          >
            {title}
          </CardItem>
        )}
        
        {icon && (
          <CardItem
            translateZ="40"
            className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mb-4"
          >
            {icon}
          </CardItem>
        )}
        
        {value && (
          <CardItem
            translateZ="50"
            className="text-3xl font-bold text-gray-900 mb-1"
          >
            {value}
          </CardItem>
        )}
        
        {description && (
          <CardItem
            translateZ="60"
            className="text-sm text-gray-500"
          >
            {description}
          </CardItem>
        )}
        
        {subtitle && (
          <CardItem
            translateZ="70"
            className="text-xs text-gray-400 mt-2"
          >
            {subtitle}
          </CardItem>
        )}
        
        {children}
      </CardBody>
    </CardContainer>
  );
}

// Specialized card for activity items
export function Activity3DCard({
  children,
  className,
  type,
  title,
  time,
  icon,
}: {
  children?: React.ReactNode;
  className?: string;
  type: 'event' | 'user' | 'booking' | 'category' | 'admin';
  title: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <CardContainer className="w-full">
      <CardBody 
        className={cn(
          "bg-white relative group/card border border-gray-200 w-full h-auto rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer",
          className
        )}
      >
        <div className="flex items-start">
          <CardItem
            translateZ="20"
            className="mr-4"
          >
            {icon}
          </CardItem>
          
          <div className="flex-1">
            <CardItem
              translateZ="30"
              className="text-sm text-gray-800"
            >
              {title}
            </CardItem>
            
            <CardItem
              translateZ="40"
              className="text-xs text-gray-500 mt-1"
            >
              {time}
            </CardItem>
          </div>
        </div>
        
        {children}
      </CardBody>
    </CardContainer>
  );
}

// Specialized card for table rows
export function TableRow3DCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContainer className="w-full">
      <CardBody 
        className={cn(
          "bg-white relative group/card border-b border-gray-200 w-full h-auto hover:bg-gray-50 transition-all duration-200",
          className
        )}
      >
        <CardItem
          translateZ="10"
          className="w-full"
        >
          {children}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
} 