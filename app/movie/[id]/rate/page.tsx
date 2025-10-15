"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";
import { StarRating } from "@/components/star-rating";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react";
import { Loader2 } from "lucide-react";
import { useReview } from "@/hooks/use-review";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SocialShare } from "@/components/social-share";
import { useTheme } from "next-themes";

export default function MovieRatingPage({
  params,
}: {
  params: { id: string };
}) {
  const [showComparison, setShowComparison] = useState(true);
  const { theme } = useTheme();
  const { id } = use<any>(params as any);
  const {
    ratings,
    review,
    isPublicReview,
    isOnline,
    isSubmitting,
    hasRatings,
    existingRating,
    handleRatingChange,
    handleReviewChange,
    handleSubmit,
    handleCancel,
    setIsPublicReview,
  } = useReview(id);

  const { data: categoryData } = useQuery(api.ratings.getCategoryAverages, {
    movieId: id as Id<"movies">,
  });

  const communityAverages = categoryData?.averages || {
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  };

  // Queries
  const { data: movie } = useQuery(api.movies.getMovieById, {
    movieId: id as Id<"movies">,
  });

  if (movie === undefined) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-foreground text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (movie === null) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-foreground text-center">Movie not found</div>
        </main>
      </div>
    );
  }

  const totalRatings = Object.values(ratings).reduce(
    (sum, rating) => sum + rating,
    0,
  );

  const comparisonData = existingRating
    ? [
        {
          category: "Acting",
          "Your Rating": existingRating.ratings.acting,
          "Community Avg": communityAverages.acting,
          difference: (
            existingRating.ratings.acting - communityAverages.acting
          ).toFixed(1),
        },
        {
          category: "Plot",
          "Your Rating": existingRating.ratings.plot,
          "Community Avg": communityAverages.plot,
          difference: (
            existingRating.ratings.plot - communityAverages.plot
          ).toFixed(1),
        },
        {
          category: "Cinematography",
          "Your Rating": existingRating.ratings.cinematography,
          "Community Avg": communityAverages.cinematography,
          difference: (
            existingRating.ratings.cinematography -
            communityAverages.cinematography
          ).toFixed(1),
        },
        {
          category: "Direction",
          "Your Rating": existingRating.ratings.direction,
          "Community Avg": communityAverages.direction,
          difference: (
            existingRating.ratings.direction - communityAverages.direction
          ).toFixed(1),
        },
        {
          category: "Entertainment",
          "Your Rating": existingRating.ratings.entertainment,
          "Community Avg": communityAverages.entertainment,
          difference: (
            existingRating.ratings.entertainment -
            communityAverages.entertainment
          ).toFixed(1),
        },
      ]
    : [];

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
        <div className="mb-6 max-w-6xl mx-auto flex items-center justify-between gap-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground dark:text-[#9ea4b7]  transition-colors font-medium"
            >
              Movies
            </Link>
            <span className="text-[#575e75]">/</span>
            <Link
              href={`/movie/${id}`}
              className="text-muted-foreground dark:text-[#9ea4b7]  transition-colors font-medium"
            >
              {movie.title}
            </Link>
            <span className="text-[#575e75]">/</span>
            <span className="text-muted-foreground font-medium">Rate</span>
          </nav>

          {showComparison && (
            <SocialShare
              title="I just rated The Enigma Code on CineRate!"
              description="Check out my rating and share your thoughts on this amazing movie."
            />
          )}
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
                <h1 className="text-4xl font-bold tracking-tighter dark:text-white text-black">
                  {movie.title}
                </h1>
                <p className="mt-2 text-gray-400">
                  {existingRating
                    ? "Update your rating"
                    : "Your rating contributes to the community score. Make it count."}
                </p>

                {/* Community Averages */}
                <div className="mt-6 rounded-lg bg-card dark:bg-[#1a1d23] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider border-border">
                    Community Averages
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-gray-300">
                        Overall
                      </span>
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 text-amber-400" filled />
                        <span className="font-semibold text-muted-foreground">
                          {movie.avgRating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / 5
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Based on {movie.reviews || 0} reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {showComparison && existingRating && (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Rating Comparison Preview
                  </h2>
                  <p className="text-foreground/80">
                    This is how your ratings will compare to the community after
                    submission.
                  </p>
                </div>

                {/* Comparison Chart */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    Your Ratings vs Community Average
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="category"
                        className="fill-foreground"
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        domain={[0, 5]}
                        className="fill-foreground"
                        tick={{ fill: "currentColor" }}
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: theme === "dark" ? "#000" : "#fff",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                        labelStyle={{
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                      />
                      <Bar
                        dataKey="Your Rating"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Community Avg"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Comparison */}
                {showComparison && existingRating && (
                  <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Detailed Comparison
                    </h3>
                    <div className="space-y-4">
                      {comparisonData.map((item) => {
                        const diff = Number.parseFloat(item.difference);
                        const isHigher = diff > 0;
                        const isEqual = diff === 0;

                        return (
                          <div
                            key={item.category}
                            className="flex items-center justify-between p-4 bg-accent rounded-lg border border-border"
                          >
                            <span className="text-foreground font-medium min-w-[140px]">
                              {item.category}
                            </span>
                            <div className="flex items-center gap-4 flex-1 justify-end">
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  Your Rating
                                </div>
                                <div className="text-lg font-bold text-blue-500">
                                  {item["Your Rating"].toFixed(1)}
                                </div>
                              </div>
                              <div className="text-muted-foreground">vs</div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  Community
                                </div>
                                <div className="text-lg font-bold text-amber-500">
                                  {item["Community Avg"].toFixed(1)}
                                </div>
                              </div>
                              <div
                                className={`min-w-[100px] text-right font-semibold ${
                                  isEqual
                                    ? "text-muted-foreground"
                                    : isHigher
                                      ? "text-green-500"
                                      : "text-red-500"
                                }`}
                              >
                                {isEqual
                                  ? "Same"
                                  : `${isHigher ? "+" : ""}${item.difference}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/movie/${params.id}`} className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Back to Movie
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Discover More Movies
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Rating Form Section */}
            <div className="mt-12">
              <div className="rounded-lg border border-border dark:border-[#292d38] bg-background dark:bg-[#1a1d23] p-6 shadow-lg sm:p-8">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  {existingRating
                    ? "Update Your Rating"
                    : "Rate Your Experience"}
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
                    className="block text-lg font-semibold"
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
                    className="min-h-[120px] resize-none border-border bg-card dark:border-[#3d4252] dark:bg-[#0f1117] placeholder:text-gray-500 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)]"
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
                      className="w-full border-[#3d4252] bg-transparent dark:text-gray-300 hover:bg-[#292d38] hover:text-white sm:w-auto"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    className={`w-full flex border-[#3d4252] items-center justify-center shadow-lg sm:w-auto ${
                      hasRatings
                        ? "bg-[var(--primary-600)] text-white shadow-[var(--primary-500)]/20 hover:bg-[var(--primary-700)] hover:shadow-xl hover:shadow-[var(--primary-500)]/30"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={handleSubmit}
                    disabled={!hasRatings || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-5 animate-spin shrink-0" />
                    ) : existingRating ? (
                      "Update Rating"
                    ) : (
                      "Submit Rating"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
