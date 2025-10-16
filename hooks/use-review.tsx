"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";

type Ratings = {
  acting: number;
  plot: number;
  cinematography: number;
  direction: number;
  entertainment: number;
};

export function useReview(movieId: Id<"movies">) {
  const [ratings, setRatings] = useState<Ratings>({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });
  const [review, setReview] = useState("");
  const [isPublicReview, setIsPublicReview] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedRatings, setHasLoadedRatings] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if coming from demo (as per PRD redirect flow)
  const fromDemo = searchParams.get("from") === "demo";
  const shouldPrefill = searchParams.get("prefill") === "true";

  // Queries
  const { data: user } = useQueryWithStatus(api.auth.loggedInUser);
  const { data: existingRating, isPending: ratingLoading } = useQuery(
    api.ratings.getUserRating,
    { movieId }
  );

  // Mutations
  const submitRating = useMutation(api.ratings.submitRating);

  // Load ratings (Priority: DB rating > localStorage demo rating)
  useEffect(() => {
    if (hasLoadedRatings || ratingLoading) return;

    // Priority 1: Existing rating in database (PRD: user already rated)
    if (existingRating) {
      setRatings(existingRating.ratings);
      setReview(existingRating.review || "");
      setHasLoadedRatings(true);
      return;
    }

    // Priority 2: Demo rating from localStorage (PRD: pre-fill after sign-up)
    if (fromDemo && shouldPrefill) {
      const demoRating = localStorage.getItem("demo_rating_inception");
      if (demoRating) {
        try {
          const parsed = JSON.parse(demoRating);
          
          // Verify it's for the correct movie
          if (parsed.ratings && parsed.movieId === movieId) {
            setRatings(parsed.ratings);
            setHasLoadedRatings(true);
            
            // Show confirmation message (PRD: "We saved your rating from the demo!")
            toast.success("We saved your rating from the demo! Submit to make it official.", {
              duration: 5000,
            });
            
            // Clean up URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("from");
            newUrl.searchParams.delete("prefill");
            window.history.replaceState({}, "", newUrl.toString());
            
            return;
          }
        } catch (e) {
          console.error("Failed to parse demo rating:", e);
        }
      }
    }

    setHasLoadedRatings(true);
  }, [existingRating, ratingLoading, hasLoadedRatings, fromDemo, shouldPrefill, movieId]);

  // Track online/offline (PRD: Handle network errors)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Confetti animation (PRD success feedback)
  const celebrate = () => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#F59E0B", "#FFCA6C", "#FDFFB8"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });
      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    [0, 100, 200].forEach((t) => setTimeout(shoot, t));
  };

  // Handlers
  const handleRatingChange = (category: keyof Ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleReviewChange = (value: string) => setReview(value);

  const handleSubmit = async () => {
    // PRD: Network error handling
    if (!isOnline) {
      toast.error("Please check your connection and try again.");
      return;
    }
    
    if (!user?._id) {
      toast.error("Please login to review!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitRating({
        movieId,
        ratings,
        review: review.trim() || undefined,
        isPublicReview,
      });

      // PRD: Success feedback
      toast.success("Rating submitted successfully!");
      celebrate();

      // PRD: Clear demo data after successful submission
      localStorage.removeItem("demo_rating_inception");
      sessionStorage.removeItem("demo_prompt_shown");
      localStorage.removeItem("signup_source");

      // PRD: Redirect after submission
      setTimeout(() => router.push(`/movie/${movieId}`), 1000);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      // PRD: Error message format
      toast.error("Oops! Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRatings({
      acting: 0,
      plot: 0,
      cinematography: 0,
      direction: 0,
      entertainment: 0,
    });
    setReview("");
    setIsPublicReview(false);
  };

  const totalRatings = Object.values(ratings).reduce((a, b) => a + b, 0);
  const hasRatings = totalRatings > 0;

  return {
    // Data
    ratings,
    review,
    isPublicReview,
    isOnline,
    isSubmitting,
    existingRating,
    hasRatings,
    isLoading: ratingLoading,

    // Handlers
    handleRatingChange,
    handleReviewChange,
    handleSubmit,
    handleCancel,
    setIsPublicReview,
  };
}