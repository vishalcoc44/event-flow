'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { FollowButton } from './ui/follow-button';
import { HoverShadowEffect } from './ui/hover-shadow-effect';
import { useSocial } from '../contexts/SocialContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, MapPin, Mail, Tag } from 'lucide-react';

interface SocialProfileProps {
  userId: string;
  showFollowButton?: boolean;
  className?: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

export const SocialProfile: React.FC<SocialProfileProps> = ({
  userId,
  showFollowButton = true,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const { getUserProfile, getUserFollowers, getUserFollows } = useSocial();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [followingEvents, setFollowingEvents] = useState<any[]>([]);
  const [followingCategories, setFollowingCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, followersData, followingUsersData, followingEventsData, followingCategoriesData] = await Promise.all([
        getUserProfile(userId),
        getUserFollowers(userId),
        getUserFollows('USER'),
        getUserFollows('EVENT'),
        getUserFollows('CATEGORY')
      ]);
      
      setProfile(profileData);
      setFollowers(followersData);
      setFollowingUsers(followingUsersData);
      setFollowingEvents(followingEventsData);
      setFollowingCategories(followingCategoriesData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const initials = profile.username?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Profile</CardTitle>
          {showFollowButton && !isOwnProfile && (
            <FollowButton
              targetId={userId}
              targetType="USER"
              targetName={profile.username}
              followerCount={profile.follower_count}
              variant="outline"
              size="sm"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" alt={profile.username} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{profile.username}</h3>
            <p className="text-muted-foreground flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {profile.email}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {profile.role.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <HoverShadowEffect className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
            <div className="text-2xl font-bold text-primary">{profile.follower_count}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </HoverShadowEffect>
          <HoverShadowEffect className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
            <div className="text-2xl font-bold text-primary">{followingUsers.length}</div>
            <div className="text-sm text-muted-foreground">Following Users</div>
          </HoverShadowEffect>
          <HoverShadowEffect className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
            <div className="text-2xl font-bold text-primary">{followingEvents.length}</div>
            <div className="text-sm text-muted-foreground">Following Events</div>
          </HoverShadowEffect>
          <HoverShadowEffect className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
            <div className="text-2xl font-bold text-primary">{followingCategories.length}</div>
            <div className="text-sm text-muted-foreground">Following Categories</div>
          </HoverShadowEffect>
        </div>

        {/* Follow Lists */}
        <div className="space-y-4">
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Followers ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Following ({followingUsers.length + followingEvents.length + followingCategories.length})
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {activeTab === 'followers' ? (
              <div className="space-y-2">
                {followers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No followers yet
                  </p>
                ) : (
                  followers.map((follow) => (
                    <HoverShadowEffect key={follow.id} className="rounded cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" alt={follow.follower?.username} />
                            <AvatarFallback className="text-xs">
                              {follow.follower?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{follow.follower?.username}</p>
                            <p className="text-xs text-muted-foreground">{follow.follower?.email}</p>
                          </div>
                        </div>
                        {!isOwnProfile && (
                          <FollowButton
                            targetId={follow.follower?.id}
                            targetType="USER"
                            targetName={follow.follower?.username}
                            variant="ghost"
                            size="sm"
                            showCount={false}
                          />
                        )}
                      </div>
                    </HoverShadowEffect>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {followingUsers.length === 0 && followingEvents.length === 0 && followingCategories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Not following anyone yet
                  </p>
                ) : (
                  <>
                    {/* Following Users */}
                    {followingUsers.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Users ({followingUsers.length})</h4>
                        {followingUsers.map((follow: any) => (
                          <HoverShadowEffect key={follow.id} className="rounded cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
                            <div className="flex items-center justify-between p-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="" alt={follow.target_user?.username} />
                                  <AvatarFallback className="text-xs">
                                    {follow.target_user?.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{follow.target_user?.username}</p>
                                  <p className="text-xs text-muted-foreground">{follow.target_user?.email}</p>
                                </div>
                              </div>
                              <FollowButton
                                targetId={follow.target_user?.id}
                                targetType="USER"
                                targetName={follow.target_user?.username}
                                variant="ghost"
                                size="sm"
                                showCount={false}
                              />
                            </div>
                          </HoverShadowEffect>
                        ))}
                      </div>
                    )}
                    
                    {/* Following Events */}
                    {followingEvents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Events ({followingEvents.length})</h4>
                        {followingEvents.map((follow: any) => (
                          <HoverShadowEffect key={follow.id} className="rounded cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
                            <div className="flex items-center justify-between p-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{follow.target_event?.title}</p>
                                  <p className="text-xs text-muted-foreground">{follow.target_event?.date}</p>
                                </div>
                              </div>
                              <FollowButton
                                targetId={follow.target_event?.id}
                                targetType="EVENT"
                                targetName={follow.target_event?.title}
                                variant="ghost"
                                size="sm"
                                showCount={false}
                              />
                            </div>
                          </HoverShadowEffect>
                        ))}
                      </div>
                    )}
                    
                    {/* Following Categories */}
                    {followingCategories.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Categories ({followingCategories.length})</h4>
                        {followingCategories.map((follow: any) => (
                          <HoverShadowEffect key={follow.id} className="rounded cursor-pointer" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.1}>
                            <div className="flex items-center justify-between p-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Tag className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{follow.target_category?.name}</p>
                                  <p className="text-xs text-muted-foreground">{follow.target_category?.description}</p>
                                </div>
                              </div>
                              <FollowButton
                                targetId={follow.target_category?.id}
                                targetType="CATEGORY"
                                targetName={follow.target_category?.name}
                                variant="ghost"
                                size="sm"
                                showCount={false}
                              />
                            </div>
                          </HoverShadowEffect>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Member Since */}
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}; 