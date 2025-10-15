"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Play, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewAllMoviesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get type and filters from URL params
  const type = searchParams.get("type") || "filtered"; // Default to filtered
  const [selectedGenre, setSelectedGenre] = useState(
    searchParams.get("genre") || "",
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || "",
  );
  const [selectedRating, setSelectedRating] = useState(
    searchParams.get("rating") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState<
    "published" | "draft" | "archived" | ""
  >((searchParams.get("status") as any) || "");
  const [sortBy, setSortBy] = useState<
    "popularity" | "recent" | "highest" | "trending"
  >((searchParams.get("sortBy") as any) || "popularity");

  // Use paginated query based on type
  const {
    results: movies,
    status,
    loadMore,
  } = usePaginatedQuery(
    type === "personalized"
      ? api.movies.getPersonalizedPicks
      : type === "hidden"
        ? api.movies.getHiddenGems
        : api.movies.getMoviesWithFiltersPaginated,
    type === "personalized"
      ? { minRating: 4 }
      : type === "hidden"
        ? {}
        : {
            genre: selectedGenre || undefined,
            year: selectedYear || undefined,
            minRating: selectedRating
              ? parseFloat(selectedRating.replace("+", ""))
              : undefined,
            status: selectedStatus || undefined,
            sortBy: sortBy,
          },
    { initialNumItems: 24 },
  );

  // Update URL when filters or type change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (type === "filtered") {
      if (selectedGenre) params.set("genre", selectedGenre);
      if (selectedYear) params.set("year", selectedYear);
      if (selectedRating) params.set("rating", selectedRating);
      if (selectedStatus) params.set("status", selectedStatus);
      params.set("sortBy", sortBy);
    }

    router.push(`/movies/all?${params.toString()}`, { scroll: false });
  }, [
    type,
    selectedGenre,
    selectedYear,
    selectedRating,
    selectedStatus,
    sortBy,
    router,
  ]);

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setSelectedStatus("");
    setSortBy("popularity");
  };

  const hasFilters =
    type === "filtered" &&
    (selectedGenre || selectedYear || selectedRating || selectedStatus);

  // Loading skeleton
  const MovieSkeleton = () => (
    <div className="">
      <Skeleton className="rounded-lg aspect-[2/3]" />
      <Skeleton className="h-4 rounded mt-3" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-3 rounded w-12" />
        <Skeleton className="h-3 rounded w-8" />
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background dark:bg-[#0f1117]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          {/* Back button */}
          <Button variant="ghost" className=" mb-6" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-foreground text-3xl font-bold mb-2">
              {type === "personalized"
                ? "Your Personalized Picks"
                : type === "hidden"
                  ? "Hidden Gems"
                  : "All Movies"}
            </h1>
            <p className="text-muted-foreground">
              {type === "personalized"
                ? "Movies tailored to your taste based on your ratings"
                : type === "hidden"
                  ? "Discover highly rated movies with fewer reviews"
                  : "Browse and discover movies with advanced filters"}
            </p>
          </div>

          {/* Type Toggle */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={type === "filtered" ? "default" : "outline"}
              className={`${
                type === "filtered" ? "bg-blue-600 hover:bg-blue-700   text-white" : " border-border"
              }  border-border`}
              onClick={() => router.push("/movies/all?type=filtered")}
            >
              All Movies
            </Button>
            <Button
              variant={type === "personalized" ? "default" : "outline"}
              className={`${
                type === "personalized"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : " border-none"
              }  border-border`}
              onClick={() => router.push("/movies/all?type=personalized")}
            >
              Personalized Picks
            </Button>
            <Button
              variant={type === "hidden" ? "default" : "outline"}
              className={`${
                type === "hidden"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-none"
              }  border-border`}
              onClick={() => router.push("/movies/all?type=hidden")}
            >
              Hidden Gems
            </Button>
          </div>

          {/* Filters (only for filtered type) */}
          {type === "filtered" && (
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    Filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: any) => setSelectedStatus(value)}
                    >
                      <SelectTrigger className="w-[110px] h-9 dark:bg-[#1d2027] border-none text-foreground">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#1d2027] dark:border-border">
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Genre Filter */}
                    <Select
                      value={selectedGenre}
                      onValueChange={setSelectedGenre}
                    >
                      <SelectTrigger className="w-[100px] h-9 dark:bg-[#1d2027] border-none text-foreground">
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#1d2027] dark:border-border">
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="horror">Horror</SelectItem>
                        <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                        <SelectItem value="thriller">Thriller</SelectItem>
                        <SelectItem value="biography">Biography</SelectItem>
                        <SelectItem value="crime">Crime</SelectItem>
                        <SelectItem value="war">War</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Year Filter */}
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-[80px] h-9 dark:bg-[#1d2027] border-none text-foreground">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#1d2027] dark:border-border">
                        {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {/* Rating Filter */}
                    <Select
                      value={selectedRating}
                      onValueChange={setSelectedRating}
                    >
                      <SelectTrigger className="w-[90px] h-9 dark:bg-[#1d2027] border-none text-foreground">
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#1d2027] dark:border-border">
                        {["4+", "3+", "2+", "1+"].map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            {rating.replace("+", ".0+")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasFilters && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-border text-muted-foreground hover:hover:text-foreground"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Sort by:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "popularity", label: "Popularity", icon: Star },
                    { value: "trending", label: "Trending", icon: TrendingUp },
                    { value: "recent", label: "Recent", icon: Star },
                    { value: "highest", label: "Highest", icon: Star },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={sortBy === value ? "default" : "outline"}
                      className={`h-9 text-xs sm:text-sm ${
                        sortBy === value
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-none"
                      }  border-border`}
                      onClick={() => setSortBy(value as any)}
                    >
                      <Icon className="mr-1 h-3 w-3" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Movies Grid */}
          {status === "LoadingFirstPage" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {[...Array(24)].map((_, i) => (
                <MovieSkeleton key={i} />
              ))}
            </div>
          ) : movies && movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <div key={movie._id} className="group">
                    <div className="bg-muted dark:bg-[#1d2027] rounded-lg overflow-hidden dark:hover:bg-[#252932] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                      <Link href={`/movie/${movie._id}`}>
                        <div
                          className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover transform group-hover:scale-105 transition-transform duration-300"
                          style={{
                            backgroundImage: `url("${movie.posterUrl || "/placeholder.jpg"}")`,
                          }}
                        >
                          {movie.status !== "published" && (
                            <div className="bg-card dark:bg-black bg-opacity-75 text-foreground text-xs px-2 py-1 m-2 rounded inline-block">
                              {movie.status}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-3">
                        <Link href={`/movie/${movie._id}`}>
                          <h3 className="text-foreground text-sm font-medium truncate hover:text-purple-400 transition-colors">
                            {movie.title}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-current" />
                            <span className="text-muted-foreground text-xs font-medium">
                              {movie.avgRating?.toFixed(1) ||
                                movie.rating?.toFixed(1) ||
                                "N/A"}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {movie.year}
                          </span>
                        </div>
                        {movie.trending && (
                          <div className="flex items-center gap-1 mt-2 text-green-400">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-xs">Trending</span>
                          </div>
                        )}
                        {type === "personalized" && (
                          <div className="mt-2 text-muted-foreground text-xs">
                            <span>Match: {movie?.matchPercentage}%</span>
                            <div>{movie.matchReasons?.join(", ")}</div>
                          </div>
                        )}
                        <div className="flex flex-wrap flex-1 gap-1 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                            asChild
                          >
                            <Link href={`/movie/${movie._id}/rate`}>
                              <Star className="h-3 w-3 mr-1" />
                              Rate
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-border text-muted-foreground hover:hover:text-foreground text-xs h-7 bg-transparent"
                            asChild
                          >
                            <Link href={`/movie/${movie._id}`}>
                              <Play className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {status === "CanLoadMore" && (
                <div className="flex justify-center mt-10">
                  <Button
                    onClick={() => loadMore(24)}
                    className="bg-purple-600 hover:bg-purple-700 text-foreground px-8 py-6 text-lg"
                  >
                    Load More Movies
                  </Button>
                </div>
              )}

              {status === "LoadingMore" && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading more movies...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-foreground text-xl font-semibold mb-2">
                No movies found
              </h3>
              <p className="text-muted-foreground mb-6">
                {type === "personalized"
                  ? "Rate some movies to get personalized recommendations."
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              {type === "filtered" && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-foreground"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
