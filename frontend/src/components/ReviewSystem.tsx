'use client';

import React, { useState, useEffect } from 'react';
import { useReviews } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Flag, Edit, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect';

interface ReviewSystemProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string; // ISO date string
  userBookings?: any[]; // Array of user's bookings for this event
}

// Star Rating Component
const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Review Form Component
const ReviewForm: React.FC<{
  eventId: string;
  eventTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingReview?: any;
  userBookings?: any[];
}> = ({ eventId, eventTitle, onSuccess, onCancel, existingReview, userBookings = [] }) => {
  const { addReview, updateReview } = useReviews();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED');
  const [isVerified, setIsVerified] = useState(existingReview?.is_verified || confirmedBookings.length > 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (existingReview) {
        await updateReview(existingReview.id, rating, title, comment);
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        await addReview(eventId, rating, title, comment, isVerified);
        toast({
          title: "Review Added",
          description: "Your review has been added successfully.",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {existingReview ? 'Edit Review' : 'Write a Review'}
          {isVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              disabled={confirmedBookings.length > 0}
              className="rounded"
            />
            <Label htmlFor="verified" className="text-sm">
              {confirmedBookings.length > 0 
                ? "✓ Verified attendee (you have a confirmed booking)" 
                : "I attended this event"
              }
            </Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Review Item Component
const ReviewItem: React.FC<{
  review: any;
  onVoteHelpful: (reviewId: string, isHelpful: boolean) => void;
  onReport: (reviewId: string, reason: string) => void;
  onEdit: (review: any) => void;
  onDelete: (reviewId: string) => void;
  isOwner: boolean;
}> = ({ review, onVoteHelpful, onReport, onEdit, onDelete, isOwner }) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleReport = () => {
    if (reportReason) {
      onReport(review.id, reportReason);
      setShowReportDialog(false);
      setReportReason('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {review.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.username}</span>
              {review.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <StarRating rating={review.rating} readonly size="sm" />
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportDialog(true)}
            className="h-8 w-8 p-0"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold text-lg">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVoteHelpful(review.id, true)}
            disabled={review.user_helpful_vote === false}
            className={`flex items-center gap-1 ${
              review.user_helpful_vote === true 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : review.user_helpful_vote === false 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:text-green-600'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful_votes_count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVoteHelpful(review.id, false)}
            disabled={review.user_helpful_vote === true}
            className={`flex items-center gap-1 ${
              review.user_helpful_vote === false 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : review.user_helpful_vote === true 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:text-red-600'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for reporting</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INAPPROPRIATE">Inappropriate content</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                  <SelectItem value="FAKE">Fake review</SelectItem>
                  <SelectItem value="OFFENSIVE">Offensive language</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleReport} disabled={!reportReason}>
                Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete your review? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(review.id);
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Rating Summary Component
const RatingSummary: React.FC<{ summary: any }> = ({ summary }) => {
  if (!summary) return null;

  const totalReviews = summary.total_reviews;
  const averageRating = summary.average_rating || 0;

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} readonly size="lg" />
            <div className="text-sm text-gray-500 mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary[`${stars}_star_count`] || 0;
              const percentage = getPercentage(count);
              
              return (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-500">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Review System Component
export const ReviewSystem: React.FC<ReviewSystemProps> = ({ eventId, eventTitle, eventDate, userBookings = [] }) => {
  const {
    reviews,
    ratingSummary,
    loading,
    error,
    loadEventReviews,
    loadEventRatingSummary,
    voteHelpful,
    reportReview,
    deleteReview,
    canReviewEvent,
    getUserReview
  } = useReviews();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadEventReviews(eventId);
    loadEventRatingSummary(eventId);
  }, [eventId]);

  const handleVoteHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const currentReview = reviews.find(r => r.id === reviewId);
      const currentVote = currentReview?.user_helpful_vote;
      
      await voteHelpful(reviewId, isHelpful);
      
      // Show appropriate message based on action
      if (currentVote === isHelpful) {
        toast({
          title: "Vote Removed",
          description: "Your vote has been removed.",
        });
      } else {
        toast({
          title: "Vote Recorded",
          description: `Marked review as ${isHelpful ? 'helpful' : 'not helpful'}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record vote.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async (reviewId: string, reason: string) => {
    try {
      await reportReview(reviewId, reason);
      toast({
        title: "Review Reported",
        description: "Thank you for your report. We'll review it shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to report review.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    loadEventReviews(eventId);
    loadEventRatingSummary(eventId);
  };

  const userReview = getUserReview(eventId);

  // Check if user can review this event
  const canUserReview = () => {
    if (!user) return false;
    
    // Check if user has already reviewed
    if (userReview) return false;
    
    // Check if user has confirmed bookings for this event (exclude cancelled)
    const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED');
    const hasBooked = confirmedBookings.length > 0;
    if (!hasBooked) return false;
    
    // Check if event has passed
    if (!eventDate) return false;
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const hasEventPassed = eventDateTime < now;
    
    return hasBooked && hasEventPassed;
  };

  // Get reason why user can't review
  const getReviewRestrictionReason = () => {
    if (!user) return "Please log in to write a review.";
    
    if (userReview) return "You have already reviewed this event.";
    
    const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED');
    const cancelledBookings = userBookings.filter(booking => booking.status === 'CANCELLED');
    
    if (userBookings.length === 0) {
      return "You must book this event before you can review it.";
    }
    
    if (confirmedBookings.length === 0 && cancelledBookings.length > 0) {
      return "You cannot review this event because your booking was cancelled.";
    }
    
    if (confirmedBookings.length === 0) {
      return "You must have a confirmed booking for this event to review it.";
    }
    
    if (!eventDate) return "Event date information is not available.";
    
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    if (eventDateTime >= now) {
      return "You can only review this event after it has taken place.";
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <RatingSummary summary={ratingSummary} />

      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user && canUserReview() && (
            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </HoverShadowEffect>
          )}
          
          {userReview && (
            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
              <Button variant="outline" onClick={() => handleEdit(userReview)}>
                Edit Your Review
              </Button>
            </HoverShadowEffect>
          )}

          {/* Show restriction message if user can't review */}
          {user && !canUserReview() && !userReview && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border">
              <Info className="w-4 h-4 inline mr-1" />
              {getReviewRestrictionReason()}
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Label className="text-sm">Sort by:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="helpful">Helpful</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
          >
            {sortOrder === 'DESC' ? '↓' : '↑'}
          </Button>
        </div>
      </div>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-xl font-semibold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </DialogTitle>
          <ReviewForm
            eventId={eventId}
            eventTitle={eventTitle}
            onSuccess={handleReviewSuccess}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            existingReview={editingReview}
            userBookings={userBookings}
          />
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p>Be the first to review this event!</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onVoteHelpful={handleVoteHelpful}
                onReport={handleReport}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isOwner={user?.id === review.user_id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}; 