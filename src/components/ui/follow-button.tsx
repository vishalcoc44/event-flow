'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, HeartOff, Users, Calendar, Tag } from 'lucide-react';

interface FollowButtonProps {
  targetId: string;
  targetType: 'USER' | 'EVENT' | 'CATEGORY';
  targetName?: string;
  followerCount?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showCount?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetId,
  targetType,
  targetName,
  followerCount = 0,
  variant = 'outline',
  size = 'default',
  className = '',
  showCount = true,
  onFollowChange
}) => {
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser, followEvent, unfollowEvent, followCategory, unfollowCategory } = useSocial();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(followerCount);

  // Check if user is following on mount
  useEffect(() => {
    if (user) {
      checkFollowStatus();
    }
  }, [user, targetId, targetType]);

  const checkFollowStatus = async () => {
    if (!user) return;
    
    try {
      const status = await isFollowing(targetId, targetType);
      setFollowing(status);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      // Redirect to login or show auth modal
      return;
    }

    if (user.id === targetId && targetType === 'USER') {
      return; // Can't follow yourself
    }

    setLoading(true);
    try {
      if (following) {
        // Unfollow
        switch (targetType) {
          case 'USER':
            await unfollowUser(targetId);
            break;
          case 'EVENT':
            await unfollowEvent(targetId);
            break;
          case 'CATEGORY':
            await unfollowCategory(targetId);
            break;
        }
        setFollowing(false);
        setCount(prev => Math.max(0, prev - 1));
        onFollowChange?.(false);
      } else {
        // Follow
        switch (targetType) {
          case 'USER':
            await followUser(targetId);
            break;
          case 'EVENT':
            await followEvent(targetId);
            break;
          case 'CATEGORY':
            await followCategory(targetId);
            break;
        }
        setFollowing(true);
        setCount(prev => prev + 1);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (following) {
      return <Heart className="w-4 h-4 fill-current" />;
    }
    
    switch (targetType) {
      case 'USER':
        return <Users className="w-4 h-4" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4" />;
      case 'CATEGORY':
        return <Tag className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    if (loading) return '...';
    
    if (following) {
      switch (targetType) {
        case 'USER':
          return 'Following';
        case 'EVENT':
          return 'Following Event';
        case 'CATEGORY':
          return 'Following Category';
        default:
          return 'Following';
      }
    } else {
      switch (targetType) {
        case 'USER':
          return 'Follow';
        case 'EVENT':
          return 'Follow Event';
        case 'CATEGORY':
          return 'Follow Category';
        default:
          return 'Follow';
      }
    }
  };

  const getButtonVariant = () => {
    if (following) {
      return 'default';
    }
    return variant;
  };

  if (!user) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          // You can trigger login modal here
          console.log('Please login to follow');
        }}
      >
        {getIcon()}
        <span className="ml-2">{getButtonText()}</span>
        {showCount && count > 0 && (
          <span className="ml-2 text-xs bg-background/50 px-2 py-1 rounded">
            {count}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      className={`${className} ${following ? 'bg-primary text-primary-foreground' : ''}`}
      onClick={handleFollowToggle}
      disabled={loading || (user.id === targetId && targetType === 'USER')}
    >
      {getIcon()}
      <span className="ml-2">{getButtonText()}</span>
      {showCount && count > 0 && (
        <span className="ml-2 text-xs bg-background/50 px-2 py-1 rounded">
          {count}
        </span>
      )}
    </Button>
  );
}; 