"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import { useReview } from "@/hooks/use-review";
import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";

type Ratings = {
  acting: number;
  plot: number;
  cinematography: number;
  direction: number;
  entertainment: number;
};

const categories: (keyof Ratings)[] = [
  "acting",
  "plot",
  "cinematography",
  "direction",
  "entertainment",
];

const MovieCardPreview = ({
  featuredMovie,
}: {
  featuredMovie: Doc<"movies">;
}) => {
  const {
    ratings,
    handleRatingChange,
    handleSubmit,
    isSubmitting,
    existingRating,
    hasRatings,
  } = useReview(featuredMovie._id);

  const handleStarClick = (category: keyof Ratings, star: number) => {
    handleRatingChange(category, star);
  };

  return (
    <div className="mt-16">
      <Card className="mx-auto max-w-md border-2 shadow-2xl">
        <CardContent className="p-6">
          {/* Movie Header */}
          <div className="mb-4 flex items-center gap-3">
            <Image
              src={featuredMovie.posterUrl || "/placeholder.svg"}
              alt={featuredMovie.title}
              height={64}
              width={48}
              className="h-16 w-12 rounded object-cover"
            />

            <div className="text-left">
              <h3 className="font-bold text-foreground">
                {featuredMovie?.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {featuredMovie?.year} • {featuredMovie?.genres?.join(", ")}
              </p>
            </div>
          </div>

          {/* Rating Categories */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">
                  {cat}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(cat, star)}
                      disabled={isSubmitting}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-4 w-4 transition-colors ${
                          star <= (ratings?.[cat] || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit or Update Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasRatings}
            className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition 
              ${
                hasRatings
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                  : "bg-gray-500 opacity-60 cursor-not-allowed"
              }`}
          >
            {isSubmitting
              ? "Saving..."
              : existingRating
                ? "Update Rating"
                : "Submit Rating"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieCardPreview;
