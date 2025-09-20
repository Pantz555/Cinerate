"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";
import { StarRating } from "@/components/star-rating";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useQuery } from "convex-helpers/react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function MovieRatingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use<any>(params as any);
  const [ratings, setRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });

  const [review, setReview] = useState("");
  const [isPublicReview, setIsPublicReview] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Queries
  const { data: movie } = useQuery(api.movies.getMovieById, {
    movieId: id as Id<"movies">,
  });
  const { data: existingRating } = useQuery(api.ratings.getUserRating, {
    movieId: id as Id<"movies">,
  });

  // Mutations
  const submitRating = useMutation(api.ratings.submitRating);

  // Load existing rating if available
  useEffect(() => {
    if (existingRating) {
      setRatings(existingRating.ratings);
      setReview(existingRating.review || "");
    }
  }, [existingRating]);

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

  const handleRatingChange = (category: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleReviewChange = (newReview: string) => {
    setReview(newReview);
  };

  const handleClick = () => {
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

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      toast.error("Please check your connection and try again.");
      return;
    }

    try {
      await submitRating({
        movieId: id as Id<"movies">,
        ratings,
        review: review.trim() || undefined,
        isPublicReview,
      });

      toast.success("Rating submitted successfully!");
      handleClick();

      setTimeout(() => {
        router.push(`/movie/${id}`);
      }, 1000);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Error submitting rating");
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

  const totalRatings = Object.values(ratings).reduce(
    (sum, rating) => sum + rating,
    0,
  );
  const hasRatings = totalRatings > 0;

  if (movie === undefined) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-white text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (movie === null) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-white text-center">Movie not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />

      {!isOnline && (
        <div className="bg-amber-600 text-white text-center py-2 text-sm">
          <span>
            You're offline. Your rating will be saved and submitted when you're
            back online.
          </span>
        </div>
      )}

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-[#9ea4b7] hover:text-white transition-colors font-medium"
            >
              Movies
            </Link>
            <span className="text-[#575e75]">/</span>
            <Link
              href={`/movie/${id}`}
              className="text-[#9ea4b7] hover:text-white transition-colors font-medium"
            >
              {movie.title}
            </Link>
            <span className="text-[#575e75]">/</span>
            <span className="text-white font-medium">Rate</span>
          </nav>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Movie Poster Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Image
                alt={`Movie poster for ${movie.title}`}
                className="aspect-[2/3] w-full max-w-sm rounded-lg object-cover shadow-2xl shadow-black/30"
                src={movie.posterUrl || "/placeholder-poster.jpg"}
                width={400}
                height={600}
              />
              <div className="mt-6 max-w-sm">
                <h1 className="text-4xl font-bold tracking-tighter text-white">
                  {movie.title}
                </h1>
                <p className="mt-2 text-gray-400">
                  {existingRating
                    ? "Update your rating"
                    : "Your rating contributes to the community score. Make it count."}
                </p>

                {/* Community Averages */}
                <div className="mt-6 rounded-lg bg-[#1a1d23] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Community Averages
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Overall</span>
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 text-amber-400" filled />
                        <span className="font-semibold text-white">
                          {movie.avgRating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">/ 5</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Based on {movie.reviews || 0} reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-[#292d38] bg-[#1a1d23] p-6 shadow-lg sm:p-8">
              <h2 className="text-2xl font-bold text-white">
                {existingRating ? "Update Your Rating" : "Rate Your Experience"}
              </h2>
              <p className="mt-1 text-gray-400">
                Select a star rating for each category below.
              </p>

              <div className="mt-8 space-y-8">
                <StarRating
                  name="acting"
                  label="Acting Performance"
                  value={ratings.acting}
                  movieId={id}
                  onChange={(value) => handleRatingChange("acting", value)}
                />

                <StarRating
                  name="plot"
                  label="Plot & Story"
                  value={ratings.plot}
                  movieId={id}
                  onChange={(value) => handleRatingChange("plot", value)}
                />

                <StarRating
                  name="cinematography"
                  label="Cinematography"
                  value={ratings.cinematography}
                  movieId={id}
                  onChange={(value) =>
                    handleRatingChange("cinematography", value)
                  }
                />

                <StarRating
                  name="direction"
                  label="Direction"
                  value={ratings.direction}
                  movieId={id}
                  onChange={(value) => handleRatingChange("direction", value)}
                />

                <StarRating
                  name="entertainment"
                  label="Entertainment Value"
                  value={ratings.entertainment}
                  movieId={id}
                  onChange={(value) =>
                    handleRatingChange("entertainment", value)
                  }
                />
              </div>

              <div className="mt-8 space-y-3">
                <label
                  htmlFor="review"
                  className="block text-lg font-semibold text-white"
                >
                  Write Your Review
                </label>
                <p className="text-sm text-gray-400">
                  Share your thoughts about the movie (optional)
                </p>
                <Textarea
                  id="review"
                  placeholder="What did you think about this movie? Share your thoughts, favorite scenes, or what made it memorable..."
                  value={review}
                  onChange={(e) => handleReviewChange(e.target.value)}
                  className="min-h-[120px] resize-none border-[#3d4252] bg-[#0f1117] text-white placeholder:text-gray-500 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="public-review"
                      checked={isPublicReview}
                      onChange={(e) => setIsPublicReview(e.target.checked)}
                      disabled={!review.trim()}
                      className="rounded border-[#3d4252] bg-[#0f1117] text-blue-600"
                    />
                    <label
                      htmlFor="public-review"
                      className="text-sm text-gray-400"
                    >
                      Make this review public (only if you write a review)
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {review.length}/1000 characters
                  </span>
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 border-t border-[#292d38] pt-6 sm:flex-row sm:justify-end">
                <Link href={`/movie/${id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-[#3d4252] bg-transparent text-gray-300 hover:bg-[#292d38] hover:text-white sm:w-auto"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  className={`w-full shadow-lg sm:w-auto ${
                    hasRatings
                      ? "bg-[var(--primary-600)] text-white shadow-[var(--primary-500)]/20 hover:bg-[var(--primary-700)] hover:shadow-xl hover:shadow-[var(--primary-500)]/30"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={handleSubmit}
                  disabled={!hasRatings}
                >
                  {existingRating ? "Update Rating" : "Submit Rating"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
