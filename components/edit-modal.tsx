import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, Star, X } from "lucide-react";
import { useQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StarRating } from "./star-rating";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

type Props = {
  id: Id<"movies">;
  setEditModalOpen: (value: boolean) => void;
};

const EditModal = ({ id, setEditModalOpen }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });

  const {
    data: movie,
    isPending,
    error,
  } = useQuery(api.movies.getMovieById, {
    movieId: id as Id<"movies">,
  });

  const { data: existingRating } = useQuery(api.ratings.getUserRating, {
    movieId: id as Id<"movies">,
  });
  const [review, setReview] = useState("");
  const [isPublicReview, setIsPublicReview] = useState(false);

  const submitRating = useMutation(api.ratings.submitRating);

  useEffect(() => {
    if (existingRating) {
      setRatings(existingRating.ratings);
      setReview(existingRating.review || "");
    }
  }, [existingRating]);

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleRatingChange = (category: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRating({
        movieId: id as Id<"movies">,
        ratings,
        review: review.trim() || undefined,
        isPublicReview,
      });

      toast.success("Rating submitted successfully!");
      setSubmitting(false);
      setEditModalOpen(false);
    } catch (error) {
      setSubmitting(false);

      console.error("Failed to submit rating:", error);
      toast.error("Error submitting rating");
    }
  };

  const handleReviewChange = (newReview: string) => {
    setReview(newReview);
  };

  const totalRatings = Object.values(ratings).reduce(
    (sum, rating) => sum + rating,
    0,
  );
  const hasRatings = totalRatings > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-bold">Edit Rating</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeEditModal}
            disabled={submitting}
            className="text-gray-400 hover:text-black p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {movie && (
          <div className="flex gap-4 mb-6">
            <div
              className="w-20 h-28 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
              style={{
                backgroundImage: `url("${movie?.posterUrl}")`,
              }}
            />
            <div className="flex-1">
              <h4 className="text-white font-semibold text-lg mb-1">
                {movie?.title}
              </h4>
              <p className="text-sm text-slate-400 mb-3">{movie?.genre}</p>
              <p className="text-sm text-slate-400">
                Current Average:{" "}
                <span className="text-white font-medium">
                  {movie?.avgRating?.toFixed(1) || "N/A"}★
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-white font-medium mb-4">Rate Each Category</p>
          <div className="mt-6 space-y-6">
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
              onChange={(value) => handleRatingChange("cinematography", value)}
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
              onChange={(value) => handleRatingChange("entertainment", value)}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <label
            htmlFor="review"
            className="block text-lg font-semibold text-white"
          >
            Write Your Review
          </label>
          <p className="text-sm text-gray-400">
            Share your thoughts about the movie
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
              <label htmlFor="public-review" className="text-sm text-gray-400">
                Make this review public (only if you write a review)
              </label>
            </div>
            <span className="text-xs text-gray-500">
              {review.length}/1000 characters
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-900 rounded-lg mt-5">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Overall Rating</span>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">
                {existingRating?.overallRating?.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={closeEditModal}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasRatings || submitting}
            className="flex-1 items-center justify-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Ratings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
