'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-bell')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
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

  return (
    <div className={`notification-bell relative ${className}`}>
      {/* Notification Bell Button */}
      <HoverShadowEffect 
        className="relative cursor-pointer p-2 rounded-lg" 
        shadowColor="rgba(0,0,0,0.1)" 
        shadowIntensity={0.15}
      >
        <div onClick={() => setIsOpen(!isOpen)}>
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-white"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </HoverShadowEffect>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingRead}
                        className="text-xs h-7 px-2"
                      >
                        {isMarkingRead ? (
                          <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.slice(0, 10).map((notification) => (
                                                 <HoverShadowEffect
                           key={notification.id}
                           className={`p-3 border-l-4 cursor-pointer transition-colors ${
                             notification.is_read 
                               ? 'bg-gray-50 border-gray-200' 
                               : 'bg-white border-blue-500'
                           }`}
                           shadowColor="rgba(0,0,0,0.05)"
                           shadowIntensity={0.1}
                         >
                           <div onClick={() => handleMarkAsRead(notification.id)}>
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className={`text-sm font-medium ${
                                  notification.is_read ? 'text-gray-600' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className={`text-xs mt-1 ${
                                notification.is_read ? 'text-gray-500' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getNotificationColor(notification.type)}`}
                                >
                                  {notification.type.replace('_', ' ').toLowerCase()}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                                                         </div>
                           </div>
                           </div>
                         </HoverShadowEffect>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 10 && (
                  <div className="border-t p-3 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        // Navigate to full notifications page
                        window.location.href = '/notifications';
                      }}
                    >
                      View all notifications ({notifications.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 