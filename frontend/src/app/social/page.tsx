'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialProfile } from '@/components/SocialProfile';
import { FollowButton } from '@/components/ui/follow-button';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { useCategories } from '@/contexts/CategoryContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Tag, Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SocialPage() {
  const { user } = useAuth();
  const { events } = useEvents();
  const { categories } = useCategories();
  const { 
    userFollows, 
    getUserFollows, 
    getUserFollowers,
    followUser,
    unfollowUser,
    followEvent,
    unfollowEvent,
    followCategory,
    unfollowCategory
  } = useSocial();

  const [activeTab, setActiveTab] = useState('profile');
  const [userFollowsData, setUserFollowsData] = useState<any[]>([]);
  const [userFollowersData, setUserFollowersData] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user]);

  const loadSocialData = async () => {
    if (!user) return;
    
    try {
      // Fetch users directly from Supabase
      const { data: users } = await supabase
        .from('users')
        .select('id, email, username, first_name, last_name, role, follower_count, created_at')
        .order('created_at', { ascending: false });

      const [follows, followers] = await Promise.all([
        getUserFollows(),
        getUserFollowers(user.id)
      ]);
      setUserFollowsData(follows);
      setUserFollowersData(followers);
      setAllUsers(users || []);
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please log in to access social features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user ? { ...user, role: user.role === 'USER' ? 'customer' : user.role } : null} />
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-2">Social Dashboard</h1>
          <p className="text-muted-foreground">
            Connect with other users, follow events, and discover categories
          </p>
        </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="follows">Following</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
              <SocialProfile userId={user.id} showFollowButton={false} />
            </HoverShadowEffect>
          </motion.div>
        </TabsContent>

        <TabsContent value="follows" className="space-y-6">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Following Users */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                <Card className="p-6 border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Following Users ({userFollowsData.filter(f => f.target_type === 'USER').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userFollowsData.filter(f => f.target_type === 'USER').length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Not following any users yet
                  </p>
                ) : (
                  userFollowsData
                    .filter(f => f.target_type === 'USER')
                    .map((follow) => (
                      <HoverShadowEffect key={follow.id} className="border rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src="" alt={follow.target_user?.username} />
                              <AvatarFallback>
                                {follow.target_user?.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{follow.target_user?.username}</p>
                              <p className="text-sm text-muted-foreground">{follow.target_user?.email}</p>
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
                    ))
                )}
              </CardContent>
                </Card>
              </HoverShadowEffect>
            </motion.div>

            {/* Followers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                <Card className="p-6 border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Followers ({userFollowersData.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userFollowersData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No followers yet
                  </p>
                ) : (
                  userFollowersData.map((follow) => (
                    <HoverShadowEffect key={follow.id} className="border rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="" alt={follow.follower?.username} />
                            <AvatarFallback>
                              {follow.follower?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{follow.follower?.username}</p>
                            <p className="text-sm text-muted-foreground">{follow.follower?.email}</p>
                          </div>
                        </div>
                        <FollowButton
                          targetId={follow.follower?.id}
                          targetType="USER"
                          targetName={follow.follower?.username}
                          variant="ghost"
                          size="sm"
                          showCount={false}
                        />
                      </div>
                    </HoverShadowEffect>
                  ))
                )}
              </CardContent>
                </Card>
              </HoverShadowEffect>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
              <Card className="p-6 border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Search Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                {allUsers
                  .filter(u => u.id !== user.id) // Exclude current user
                  .filter(u => 
                    searchTerm === '' || 
                    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((userItem) => (
                    <HoverShadowEffect key={userItem.id} className="border rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="" alt={userItem.username} />
                            <AvatarFallback>
                              {userItem.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{userItem.username}</p>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {userItem.first_name} {userItem.last_name}
                            </p>
                          </div>
                        </div>
                        <FollowButton
                          targetId={userItem.id}
                          targetType="USER"
                          targetName={userItem.username}
                          followerCount={userItem.follower_count || 0}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                    </HoverShadowEffect>
                  ))}
                {allUsers.filter(u => u.id !== user.id).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            </CardContent>
              </Card>
            </HoverShadowEffect>
          </motion.div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
              <Card className="p-6 border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Follow Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center col-span-full py-4">
                    No events available
                  </p>
                ) : (
                  events.map((event) => (
                    <HoverShadowEffect key={event.id} className="border rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                        <FollowButton
                          targetId={event.id}
                          targetType="EVENT"
                          targetName={event.title}
                          followerCount={(event as any).follower_count || 0}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </HoverShadowEffect>
                  ))
                )}
              </div>
            </CardContent>
              </Card>
            </HoverShadowEffect>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
              <Card className="p-6 border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Follow Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length === 0 ? (
                  <p className="text-muted-foreground text-center col-span-full py-4">
                    No categories available
                  </p>
                ) : (
                  categories.map((category) => (
                    <HoverShadowEffect key={category.id} className="border rounded-lg cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <FollowButton
                          targetId={category.id}
                          targetType="CATEGORY"
                          targetName={category.name}
                          followerCount={(category as any).follower_count || 0}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </HoverShadowEffect>
                  ))
                )}
              </div>
            </CardContent>
              </Card>
            </HoverShadowEffect>
          </motion.div>
        </TabsContent>
      </Tabs>
      </div>
      <Footer />
    </div>
  );
} 