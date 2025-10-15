"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  // Queries
  const { data: user } = useQueryWithStatus(api.auth.loggedInUser);
  const { data: existingRating } = useQuery(api.ratings.getUserRating, {
    movieId,
  });

  // Mutations
  const submitRating = useMutation(api.ratings.submitRating);

  // Load existing rating
  useEffect(() => {
    if (existingRating) {
      setRatings(existingRating.ratings);
      setReview(existingRating.review || "");
    }
  }, [existingRating]);

  // Track online/offline
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

  // Confetti animation
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
    if (!isOnline)
      return toast.error("Please check your connection and try again.");
    if (!user?._id) return toast.error("Please login to review!");

    setIsSubmitting(true);
    try {
      await submitRating({
        movieId,
        ratings,
        review: review.trim() || undefined,
        isPublicReview,
      });

      toast.success("Rating submitted successfully!");
      celebrate();

      setTimeout(() => router.push(`/movie/${movieId}`), 1000);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Error submitting rating");
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

    // Handlers
    handleRatingChange,
    handleReviewChange,
    handleSubmit,
    handleCancel,
    setIsPublicReview,
  };
}
