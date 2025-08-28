'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Review {
  id: string;
  event_id: string;
  user_id: string;
  username: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  is_helpful: number;
  created_at: string;
  updated_at: string;
  helpful_votes_count?: number;
  user_helpful_vote?: boolean;
}

interface EventRatingSummary {
  event_id: string;
  event_title: string;
  total_reviews: number;
  verified_reviews: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  latest_review?: string;
}

interface ReviewContextType {
  reviews: Review[];
  ratingSummary: EventRatingSummary | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadEventReviews: (eventId: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: string) => Promise<void>;
  loadEventRatingSummary: (eventId: string) => Promise<void>;
  addReview: (eventId: string, rating: number, title?: string, comment?: string, isVerified?: boolean) => Promise<string>;
  updateReview: (reviewId: string, rating?: number, title?: string, comment?: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  voteHelpful: (reviewId: string, isHelpful: boolean) => Promise<boolean>;
  reportReview: (reviewId: string, reason: string, description?: string) => Promise<string>;
  
  // Utilities
  canReviewEvent: (eventId: string) => boolean;
  getUserReview: (eventId: string) => Review | null;
  getAverageRating: () => number;
  getRatingDistribution: () => { [key: number]: number };
  
  // Testing
  testReviewSystem: (eventId: string) => Promise<boolean>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<EventRatingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reviews for a specific event
  const loadEventReviews = async (
    eventId: string, 
    limit: number = 10, 
    offset: number = 0, 
    sortBy: string = 'created_at', 
    sortOrder: string = 'DESC'
  ) => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use direct table query instead of custom function
      let query = supabase
        .from('reviews')
        .select(`
          *,
          events!inner(title),
          review_helpful_votes!left(id, is_helpful, user_id)
        `)
        .eq('id', eventId)
        .order(sortBy, { ascending: sortOrder === 'ASC' })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedReviews = (data || []).map((review: any) => {
        const userVote = review.review_helpful_votes?.find((vote: any) => vote.user_id === user?.id);
        const helpfulVotesCount = review.review_helpful_votes?.filter((vote: any) => vote.is_helpful === true).length || 0;
        
        return {
          id: review.id,
          event_id: review.event_id,
          user_id: review.user_id,
          username: 'Anonymous', // We'll get username from user metadata when needed
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          is_verified: review.is_verified,
          is_helpful: review.is_helpful,
          created_at: review.created_at,
          updated_at: review.updated_at,
          helpful_votes_count: helpfulVotesCount,
          user_helpful_vote: userVote?.is_helpful
        };
      });
      
      setReviews(transformedReviews);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      setError(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Load rating summary for an event (calculated from reviews table)
  const loadEventRatingSummary = async (eventId: string) => {
    if (!eventId) return;

    try {
      setError(null);

      // Calculate rating summary from reviews table
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, is_verified, title, created_at')
        .eq('event_id', eventId); // Reviews table uses event_id to reference events

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        setRatingSummary({
          event_id: eventId,
          event_title: '', // We don't have event title here, could be added later
          total_reviews: 0,
          verified_reviews: 0,
          average_rating: 0,
          five_star_count: 0,
          four_star_count: 0,
          three_star_count: 0,
          two_star_count: 0,
          one_star_count: 0
        });
        return;
      }

      // Calculate statistics
      const totalReviews = reviews.length;
      const verifiedReviews = reviews.filter(review => review.is_verified).length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

      // Calculate rating distribution
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      });

      // Find latest review date
      const latestReviewDate = reviews
        .map(review => new Date(review.created_at))
        .sort((a, b) => b.getTime() - a.getTime())[0]
        ?.toISOString();

      setRatingSummary({
        event_id: eventId,
        event_title: '', // We don't have event title here, could be added later
        total_reviews: totalReviews,
        verified_reviews: verifiedReviews,
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        five_star_count: ratingCounts[5],
        four_star_count: ratingCounts[4],
        three_star_count: ratingCounts[3],
        two_star_count: ratingCounts[2],
        one_star_count: ratingCounts[1],
        latest_review: latestReviewDate
      });
    } catch (error: any) {
      console.error('Error loading rating summary:', error);
      setError(error.message || 'Failed to load rating summary');
    }
  };

  // Test function to verify the system works
  const testReviewSystem = async (eventId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('Testing review system...');
      
      // Test adding a review
      const reviewId = await addReview(eventId, 5, 'Test Review', 'This is a test review', true);
      console.log('Review added successfully:', reviewId);
      
      // Test loading reviews
      await loadEventReviews(eventId);
      console.log('Reviews loaded successfully');
      
      // Test loading rating summary
      await loadEventRatingSummary(eventId);
      console.log('Rating summary loaded successfully');
      
      return true;
    } catch (error) {
      console.error('Test failed:', error);
      return false;
    }
  };

  // Add a new review
  const addReview = async (
    eventId: string, 
    rating: number, 
    title?: string, 
    comment?: string, 
    isVerified: boolean = false
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          event_id: eventId,
          user_id: user.id,
          rating,
          title: title || null,
          comment: comment || null,
          is_verified: isVerified
        })
        .select()
        .single();

      if (error) throw error;

      // Reload reviews and summary
      await loadEventReviews(eventId);
      await loadEventRatingSummary(eventId);
      
      return data.id;
    } catch (error: any) {
      console.error('Error adding review:', error);
      setError(error.message || 'Failed to add review');
      throw error;
    }
  };

  // Update an existing review
  const updateReview = async (
    reviewId: string, 
    rating?: number, 
    title?: string, 
    comment?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: rating || undefined,
          title: title || null,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Reload reviews
      if (reviews.length > 0) {
        await loadEventReviews(reviews[0].event_id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating review:', error);
      setError(error.message || 'Failed to update review');
      return false;
    }
  };

  // Delete a review
  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Reload summary
      if (reviews.length > 0) {
        await loadEventRatingSummary(reviews[0].event_id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting review:', error);
      setError(error.message || 'Failed to delete review');
      return false;
    }
  };

  // Vote on review helpfulness
  const voteHelpful = async (reviewId: string, isHelpful: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      
      // Check current vote state
      const currentReview = reviews.find(r => r.id === reviewId);
      const currentVote = currentReview?.user_helpful_vote;
      
      // If clicking the same vote, remove it (undo)
      if (currentVote === isHelpful) {
        const { error: deleteError } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Update local state - remove vote
        setReviews(prev => prev.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              helpful_votes_count: isHelpful ? Math.max(0, (review.helpful_votes_count || 0) - 1) : review.helpful_votes_count || 0,
              user_helpful_vote: undefined
            };
          }
          return review;
        }));
      } else {
        // Check if user already has a vote for this review
        const { data: existingVote, error: checkError } = await supabase
          .from('review_helpful_votes')
          .select('*')
          .eq('review_id', reviewId)
          .eq('user_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingVote) {
          // Update existing vote
          const { error: updateError } = await supabase
            .from('review_helpful_votes')
            .update({ is_helpful: isHelpful })
            .eq('review_id', reviewId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          // Insert new vote
          const { error: insertError } = await supabase
            .from('review_helpful_votes')
            .insert({
              review_id: reviewId,
              user_id: user.id,
              is_helpful: isHelpful
            });

          if (insertError) throw insertError;
        }

        // Update local state
        setReviews(prev => prev.map(review => {
          if (review.id === reviewId) {
            let newHelpfulCount = review.helpful_votes_count || 0;
            
            // If user had a previous vote, adjust the count
            if (currentVote === true) {
              newHelpfulCount -= 1; // Remove previous helpful vote
            } else if (currentVote === false) {
              // Previous vote was not helpful, so no change to helpful count
            }
            
            // Add new vote if it's helpful
            if (isHelpful) {
              newHelpfulCount += 1;
            }
            
            return {
              ...review,
              helpful_votes_count: Math.max(0, newHelpfulCount),
              user_helpful_vote: isHelpful
            };
          }
          return review;
        }));
      }
      
      return true;
    } catch (error: any) {
      console.error('Error voting on review:', error);
      setError(error.message || 'Failed to vote on review');
      return false;
    }
  };

  // Report a review
  const reportReview = async (
    reviewId: string, 
    reason: string, 
    description?: string
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          reporter_id: user.id,
          reason,
          description: description || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error reporting review:', error);
      setError(error.message || 'Failed to report review');
      throw error;
    }
  };

  // Check if user can review an event (has booked ticket, event has passed, and hasn't already reviewed)
  const canReviewEvent = (eventId: string): boolean => {
    if (!user) return false;
    
    // Check if user has already reviewed this event
    if (reviews.some(review => review.user_id === user.id)) {
      return false;
    }
    
    // We need to check booking status and event date
    // This will be handled by the component that calls this function
    // by passing additional context about bookings and event date
    return true;
  };

  // Get user's review for an event
  const getUserReview = (eventId: string): Review | null => {
    if (!user) return null;
    return reviews.find(review => review.user_id === user.id) || null;
  };

  // Get average rating from current reviews
  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  // Get rating distribution
  const getRatingDistribution = (): { [key: number]: number } => {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      ratingSummary,
      loading,
      error,
      loadEventReviews,
      loadEventRatingSummary,
      addReview,
      updateReview,
      deleteReview,
      voteHelpful,
      reportReview,
      canReviewEvent,
      getUserReview,
      getAverageRating,
      getRatingDistribution,
      testReviewSystem
    }}>
      {children}
    </ReviewContext.Provider>
  );
}; 