'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventRatingProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const EventRating: React.FC<EventRatingProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (reviewCount === 0) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <Star className={sizeClasses[size]} />
        <span className={textSizeClasses[size]}>No reviews</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className={`font-medium ${textSizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

// Compact rating badge for event cards
export const RatingBadge: React.FC<{
  rating: number;
  reviewCount: number;
}> = ({ rating, reviewCount }) => {
  if (reviewCount === 0) return null;

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{rating.toFixed(1)}</span>
      <span className="text-xs">({reviewCount})</span>
    </Badge>
  );
}; 