'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Settings, Trash2, Check, Filter, Search, Clock, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { 
    notifications, 
    preferences, 
    summary, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    updatePreferences,
    clearOldNotifications 
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.is_read) ||
                       (filterRead === 'unread' && !notification.is_read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearOldNotifications = async () => {
    setIsClearing(true);
    try {
      const deletedCount = await clearOldNotifications();
      console.log(`Cleared ${deletedCount} old notifications`);
    } finally {
      setIsClearing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_CREATED':
      case 'CATEGORY_UPDATE':
        return '🎉';
      case 'EVENT_REMINDER':
      case 'BOOKING_REMINDER':
        return '⏰';
      case 'BOOKING_CONFIRMED':
        return '✅';
      case 'FOLLOW_UPDATE':
        return '👥';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'EVENT_REMINDER':
      case 'BOOKING_REMINDER':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'BOOKING_CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FOLLOW_UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EVENT_CREATED':
      case 'CATEGORY_UPDATE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Please log in to view notifications.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                  <p className="text-gray-600">
                    {summary ? `${summary.total_notifications} total notifications` : 'Loading...'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreferences(!showPreferences)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={notifications.filter(n => !n.is_read).length === 0}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <HoverShadowEffect className="bg-white border border-gray-200 rounded-xl p-4" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="EVENT_CREATED">Event Created</SelectItem>
                      <SelectItem value="EVENT_REMINDER">Event Reminder</SelectItem>
                      <SelectItem value="BOOKING_CONFIRMED">Booking Confirmed</SelectItem>
                      <SelectItem value="BOOKING_REMINDER">Booking Reminder</SelectItem>
                      <SelectItem value="FOLLOW_UPDATE">Follow Update</SelectItem>
                      <SelectItem value="CATEGORY_UPDATE">Category Update</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </HoverShadowEffect>
            </motion.div>

            {/* Notifications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <HoverShadowEffect className="bg-white border border-gray-200 rounded-xl p-8 text-center" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                      ? "Try adjusting your search or filters." 
                      : "You're all caught up! No notifications yet."}
                  </p>
                </HoverShadowEffect>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <HoverShadowEffect
                          className={`border rounded-xl cursor-pointer transition-colors ${
                            notification.is_read 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-white border-blue-500 shadow-sm'
                          }`}
                          shadowColor="rgba(0,0,0,0.1)"
                          shadowIntensity={0.15}
                        >
                          <div className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="text-2xl">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h4 className={`text-sm font-medium ${
                                    notification.is_read ? 'text-gray-600' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className={`text-sm mt-2 ${
                                  notification.is_read ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getNotificationColor(notification.type)}`}
                                  >
                                    {notification.type.replace('_', ' ').toLowerCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </HoverShadowEffect>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Stats */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <HoverShadowEffect className="bg-white border border-gray-200 rounded-xl p-6" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                <h3 className="text-lg font-semibold mb-4">Notification Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <Badge variant="outline">{summary?.total_notifications || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unread</span>
                    <Badge variant="destructive">{summary?.unread_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reminders</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      {summary?.reminder_count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bookings</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {summary?.booking_count || 0}
                    </Badge>
                  </div>
                </div>
              </HoverShadowEffect>
            </motion.div>

            {/* Preferences */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HoverShadowEffect className="bg-white border border-gray-200 rounded-xl p-6 mb-6" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    {preferences && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4 text-gray-500" />
                            <Label htmlFor="push-notifications" className="text-sm">Push Notifications</Label>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={preferences.push_notifications}
                            onCheckedChange={(checked) => updatePreferences({ push_notifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="event-reminders" className="text-sm">Event Reminders</Label>
                          <Switch
                            id="event-reminders"
                            checked={preferences.event_reminders}
                            onCheckedChange={(checked) => updatePreferences({ event_reminders: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="booking-reminders" className="text-sm">Booking Reminders</Label>
                          <Switch
                            id="booking-reminders"
                            checked={preferences.booking_reminders}
                            onCheckedChange={(checked) => updatePreferences({ booking_reminders: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="follow-updates" className="text-sm">Follow Updates</Label>
                          <Switch
                            id="follow-updates"
                            checked={preferences.follow_updates}
                            onCheckedChange={(checked) => updatePreferences({ follow_updates: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="category-updates" className="text-sm">Category Updates</Label>
                          <Switch
                            id="category-updates"
                            checked={preferences.category_updates}
                            onCheckedChange={(checked) => updatePreferences({ category_updates: checked })}
                          />
                        </div>
                      </div>
                    )}
                  </HoverShadowEffect>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <HoverShadowEffect className="bg-white border border-gray-200 rounded-xl p-6" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15}>
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearOldNotifications}
                    disabled={isClearing}
                    className="w-full"
                  >
                    {isClearing ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Clear Old Notifications
                  </Button>
                </div>
              </HoverShadowEffect>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 