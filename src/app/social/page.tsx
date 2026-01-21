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
import { GlassTile } from '@/components/ui/glass-tile';

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f3f4f6]">
        <GlassTile className="max-w-md w-full text-center py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access social features.
          </p>
          <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Log In
          </a>
        </GlassTile>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#f3f4f6]">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob"></div>
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <motion.div
            className="mb-10 text-center md:text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Social Dashboard</h1>
            <p className="text-gray-600 text-lg">
              Connect with other users, follow events, and discover categories
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <TabsList className="inline-flex h-auto items-center justify-start p-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm border border-white/40">
                <TabsTrigger value="profile" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">Profile</TabsTrigger>
                <TabsTrigger value="follows" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">Following</TabsTrigger>
                <TabsTrigger value="search" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">Search</TabsTrigger>
                <TabsTrigger value="events" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">Events</TabsTrigger>
                <TabsTrigger value="categories" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">Categories</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <GlassTile className="p-0 overflow-hidden" interactive={false}>
                  <div className="p-8">
                    <SocialProfile userId={user.id} showFollowButton={false} />
                  </div>
                </GlassTile>
              </motion.div>
            </TabsContent>

            <TabsContent value="follows" className="space-y-6">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
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
                  <GlassTile className="h-full flex flex-col" interactive={false}>
                    <div className="flex items-center mb-6">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Following Users</h3>
                        <p className="text-sm text-gray-500">People you are following ({userFollowsData.filter(f => f.target_type === 'USER').length})</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      {userFollowsData.filter(f => f.target_type === 'USER').length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                          <Users className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 font-medium">Not following any users yet</p>
                        </div>
                      ) : (
                        userFollowsData
                          .filter(f => f.target_type === 'USER')
                          .map((follow) => (
                            <div key={follow.id} className="bg-white/50 rounded-xl p-4 border border-white/60 hover:shadow-sm transition-all shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                    <AvatarImage src="" alt={follow.target_user?.username} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                                      {follow.target_user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-gray-900">{follow.target_user?.username}</p>
                                    <p className="text-sm text-gray-500">{follow.target_user?.email}</p>
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
                            </div>
                          ))
                      )}
                    </div>
                  </GlassTile>
                </motion.div>

                {/* Followers */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <GlassTile className="h-full flex flex-col" interactive={false}>
                    <div className="flex items-center mb-6">
                      <div className="p-3 rounded-full bg-pink-100 text-pink-600 mr-4">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Followers</h3>
                        <p className="text-sm text-gray-500">People following you ({userFollowersData.length})</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      {userFollowersData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                          <Heart className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 font-medium">No followers yet</p>
                        </div>
                      ) : (
                        userFollowersData.map((follow) => (
                          <div key={follow.id} className="bg-white/50 rounded-xl p-4 border border-white/60 hover:shadow-sm transition-all shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                  <AvatarImage src="" alt={follow.follower?.username} />
                                  <AvatarFallback className="bg-gradient-to-br from-pink-100 to-orange-100 text-pink-600">
                                    {follow.follower?.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-gray-900">{follow.follower?.username}</p>
                                  <p className="text-sm text-gray-500">{follow.follower?.email}</p>
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
                          </div>
                        ))
                      )}
                    </div>
                  </GlassTile>
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
                <GlassTile className="min-h-[500px]" interactive={false}>
                  <div className="flex items-center mb-8">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Search Users</h3>
                      <p className="text-sm text-gray-500">Find and connect with others</p>
                    </div>
                  </div>

                  <div className="mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search by username, email, or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 h-12 bg-white/50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 rounded-xl text-lg transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div key={userItem.id} className="bg-white/40 rounded-xl p-4 border border-white/60 hover:bg-white/60 hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                <AvatarImage src="" alt={userItem.username} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                  {userItem.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{userItem.username}</p>
                                <p className="text-xs text-gray-500 w-32 truncate" title={userItem.email}>{userItem.email}</p>
                                <p className="text-xs text-gray-400 mt-1">
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
                        </div>
                      ))}
                    {allUsers.filter(u => u.id !== user.id).length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center opacity-70">
                        <Users className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No users found</p>
                      </div>
                    )}
                  </div>
                </GlassTile>
              </motion.div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <GlassTile className="" interactive={false}>
                  <div className="flex items-center mb-8">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Follow Events</h3>
                      <p className="text-sm text-gray-500">Stay updated on events you're interested in</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center opacity-70">
                        <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No events available</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <div key={event.id} className="bg-white/40 rounded-xl p-5 border border-white/60 hover:bg-white/60 hover:shadow-lg transition-all flex flex-col h-full group">
                          <div className="flex-grow space-y-3 mb-4">
                            <div>
                              <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1" title={event.title}>{event.title}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2.5em]">{event.description}</p>
                            </div>

                            <div className="bg-white/50 rounded-lg p-2 space-y-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar className="w-3 h-3 mr-2 text-orange-400" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Search className="w-3 h-3 mr-2 text-orange-400" />
                                {event.time}
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 flex items-center">
                              <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                              {event.location}
                            </p>
                          </div>
                          <FollowButton
                            targetId={event.id}
                            targetType="EVENT"
                            targetName={event.title}
                            followerCount={(event as any).follower_count || 0}
                            variant="outline"
                            size="sm"
                            className="w-full mt-auto"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </GlassTile>
              </motion.div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <GlassTile className="" interactive={false}>
                  <div className="flex items-center mb-8">
                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Follow Categories</h3>
                      <p className="text-sm text-gray-500">Personalize your feed by interest</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center opacity-70">
                        <Tag className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No categories available</p>
                      </div>
                    ) : (
                      categories?.filter(category => category && category.id && category.name).map((category) => (
                        <div key={category.id} className="bg-white/40 rounded-xl p-5 border border-white/60 hover:bg-white/60 hover:shadow-lg transition-all group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">{category.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                              <Tag className="w-5 h-5 text-emerald-500" />
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100/50">
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
                        </div>
                      ))
                    )}
                  </div>
                </GlassTile>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
        <Footer />
      </div>
    </div>
  );
}