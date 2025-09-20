"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Shuffle,
  Star,
  Play,
  Film,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { StructuredMovies } from "@/lib/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "published" | "draft" | "archived" | "all" | ""
  >("");
  const [sortBy, setSortBy] = useState<
    "popularity" | "recent" | "highest" | "trending"
  >("popularity");
  const [debounced] = useDebouncedValue(searchQuery, 200);
  const [searchedMovies, setSearchedMovies] = useState<StructuredMovies | []>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  const statusForQuery =
    selectedStatus === "all" || selectedStatus === ""
      ? undefined
      : selectedStatus;

  const searchMovie = useAction(api.rag.searchEmbedMovie);

  useEffect(() => {
    const fetch = async () => {
      setIsSearching(true);
      const data = await searchMovie({ query: debounced });
      console.log("value", data);
      const structuredMovies = data?.results
        .map((result) => {
          const entry = data.entries.find((e) => e.entryId === result.entryId);
          if (!entry) return null;

          return {
            movieId: entry?.metadata?.movieId,
            title: entry?.metadata?.title,
            posterUrl: entry?.metadata?.posterUrl,
            score: Number(result.score.toFixed(2)),
          };
        })
        .filter(Boolean);

      setSearchedMovies(structuredMovies as StructuredMovies);
      setIsSearching(false);
    };
    if (debounced.trim()) {
      fetch();
    } else {
      setSearchedMovies([]);
      setIsSearching(false);
    }
  }, [debounced, searchMovie]);

  // Fetch filtered movies from Convex
  const filteredMovies = useQuery(api.movies.getMoviesWithFilters, {
    searchQuery: debounced || undefined,
    genre: selectedGenre || undefined,
    year: selectedYear || undefined,
    minRating: selectedRating
      ? parseFloat(selectedRating.replace("+", ""))
      : undefined,
    status: statusForQuery,
    sortBy: sortBy,
  });

  // Fetch recently rated movies
  const recentlyRatedMovies = useQuery(api.movies.getUserRecentlyRatedMovies, {
    limit: 5,
  });

  // Fetch trending movies
  const trendingMovies = useQuery(api.movies.getTrendingMovies, {
    limit: 10,
  });

  const currentMovies = debounced.trim()
    ? searchedMovies
    : (filteredMovies ?? []);
  const moviesLength = currentMovies.length;

  const handleRandomMovie = () => {
    if (currentMovies && currentMovies.length > 0) {
      const randomMovie: any =
        currentMovies[Math.floor(Math.random() * currentMovies.length)];
      window.location.href = `/movie/${randomMovie?.movieId || randomMovie?._id}`;
    }
  };

  const showSearchResults =
    debounced.trim() ||
    searchQuery.trim() ||
    selectedGenre ||
    selectedYear ||
    selectedRating ||
    selectedStatus;

  // Loading skeleton component
  const MovieSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-700 rounded-lg aspect-[2/3]" />
      <div className="h-4 bg-gray-700 rounded mt-3" />
      <div className="flex justify-between mt-2">
        <div className="h-3 bg-gray-700 rounded w-12" />
        <div className="h-3 bg-gray-700 rounded w-8" />
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0f1117]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col gap-6">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                className="w-full rounded-md border-none bg-[#1d2027] h-14 placeholder:text-gray-400 text-white pl-12 pr-4 text-base"
                placeholder="Search for movies by title, director, actor, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters and Sort Options */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
                    Filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: any) => {
                        if (value === "all") {
                          setSelectedStatus("");
                        } else {
                          setSelectedStatus(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[110px] h-9 bg-[#1d2027] border-none text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d2027] border-gray-600">
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-gray-700"
                        >
                          All Status
                        </SelectItem>
                        <SelectItem
                          value="published"
                          className="text-white hover:bg-gray-700"
                        >
                          Published
                        </SelectItem>
                        <SelectItem
                          value="draft"
                          className="text-white hover:bg-gray-700"
                        >
                          Draft
                        </SelectItem>
                        <SelectItem
                          value="archived"
                          className="text-white hover:bg-gray-700"
                        >
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Genre Filter */}
                    <Select
                      value={selectedGenre}
                      onValueChange={(value) =>
                        setSelectedGenre(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-[100px] h-9 bg-[#1d2027] border-none text-white">
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d2027] border-gray-600">
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-gray-700"
                        >
                          All Genres
                        </SelectItem>
                        <SelectItem
                          value="action"
                          className="text-white hover:bg-gray-700"
                        >
                          Action
                        </SelectItem>
                        <SelectItem
                          value="comedy"
                          className="text-white hover:bg-gray-700"
                        >
                          Comedy
                        </SelectItem>
                        <SelectItem
                          value="drama"
                          className="text-white hover:bg-gray-700"
                        >
                          Drama
                        </SelectItem>
                        <SelectItem
                          value="horror"
                          className="text-white hover:bg-gray-700"
                        >
                          Horror
                        </SelectItem>
                        <SelectItem
                          value="sci-fi"
                          className="text-white hover:bg-gray-700"
                        >
                          Sci-Fi
                        </SelectItem>
                        <SelectItem
                          value="thriller"
                          className="text-white hover:bg-gray-700"
                        >
                          Thriller
                        </SelectItem>
                        <SelectItem
                          value="biography"
                          className="text-white hover:bg-gray-700"
                        >
                          Biography
                        </SelectItem>
                        <SelectItem
                          value="crime"
                          className="text-white hover:bg-gray-700"
                        >
                          Crime
                        </SelectItem>
                        <SelectItem
                          value="war"
                          className="text-white hover:bg-gray-700"
                        >
                          War
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Year Filter */}
                    <Select
                      value={selectedYear}
                      onValueChange={(value) =>
                        setSelectedYear(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-[80px] h-9 bg-[#1d2027] border-none text-white">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d2027] border-gray-600">
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-gray-700"
                        >
                          All Years
                        </SelectItem>
                        <SelectItem
                          value="2025"
                          className="text-white hover:bg-gray-700"
                        >
                          2025
                        </SelectItem>
                        <SelectItem
                          value="2024"
                          className="text-white hover:bg-gray-700"
                        >
                          2024
                        </SelectItem>
                        <SelectItem
                          value="2023"
                          className="text-white hover:bg-gray-700"
                        >
                          2023
                        </SelectItem>
                        <SelectItem
                          value="2022"
                          className="text-white hover:bg-gray-700"
                        >
                          2022
                        </SelectItem>
                        <SelectItem
                          value="2021"
                          className="text-white hover:bg-gray-700"
                        >
                          2021
                        </SelectItem>
                        <SelectItem
                          value="2020"
                          className="text-white hover:bg-gray-700"
                        >
                          2020
                        </SelectItem>
                        <SelectItem
                          value="2019"
                          className="text-white hover:bg-gray-700"
                        >
                          2019
                        </SelectItem>
                        <SelectItem
                          value="2018"
                          className="text-white hover:bg-gray-700"
                        >
                          2018
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Rating Filter */}
                    <Select
                      value={selectedRating}
                      onValueChange={(value) =>
                        setSelectedRating(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-[90px] h-9 bg-[#1d2027] border-none text-white">
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d2027] border-gray-600">
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-gray-700"
                        >
                          All Ratings
                        </SelectItem>
                        <SelectItem
                          value="9+"
                          className="text-white hover:bg-gray-700"
                        >
                          9.0+
                        </SelectItem>
                        <SelectItem
                          value="8+"
                          className="text-white hover:bg-gray-700"
                        >
                          8.0+
                        </SelectItem>
                        <SelectItem
                          value="7+"
                          className="text-white hover:bg-gray-700"
                        >
                          7.0+
                        </SelectItem>
                        <SelectItem
                          value="6+"
                          className="text-white hover:bg-gray-700"
                        >
                          6.0+
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
                    Sort by:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortBy === "popularity" ? "default" : "outline"}
                      className={`h-9 text-xs sm:text-sm ${sortBy === "popularity" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#1d2027] border-none hover:bg-gray-700 hover:text-white"} text-white`}
                      onClick={() => setSortBy("popularity")}
                    >
                      <Award className="mr-1 h-3 w-3" />
                      Popularity
                    </Button>
                    <Button
                      variant={sortBy === "trending" ? "default" : "outline"}
                      className={`h-9 text-xs sm:text-sm ${sortBy === "trending" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#1d2027] border-none hover:bg-gray-700 hover:text-white"} text-white`}
                      onClick={() => setSortBy("trending")}
                    >
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Trending
                    </Button>
                    <Button
                      variant={sortBy === "recent" ? "default" : "outline"}
                      className={`h-9 text-xs sm:text-sm ${sortBy === "recent" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#1d2027] border-none hover:bg-gray-700 hover:text-white"} text-white`}
                      onClick={() => setSortBy("recent")}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Recent
                    </Button>
                    <Button
                      variant={sortBy === "highest" ? "default" : "outline"}
                      className={`h-9 text-xs sm:text-sm ${sortBy === "highest" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#1d2027] border-none hover:bg-gray-700 hover:text-white"} text-white`}
                      onClick={() => setSortBy("highest")}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Highest
                    </Button>
                  </div>
                </div>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white h-9 text-xs sm:text-sm self-start sm:self-auto"
                  onClick={handleRandomMovie}
                  disabled={moviesLength === 0}
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Random Movie
                </Button>
              </div>
            </div>
          </div>

          {showSearchResults ? (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">
                  Search Results
                  <span className="text-gray-400 text-lg font-normal ml-2">
                    ({moviesLength} {moviesLength === 1 ? "movie" : "movies"})
                  </span>
                </h2>
                {(debounced ||
                  selectedGenre ||
                  selectedYear ||
                  selectedRating ||
                  selectedStatus) && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("");
                      setSelectedYear("");
                      setSelectedRating("");
                      setSelectedStatus("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {(debounced.trim() && isSearching) ||
              (!debounced.trim() && !filteredMovies) ? (
                // Loading state
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <MovieSkeleton key={i} />
                  ))}
                </div>
              ) : moviesLength > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {debounced.trim()
                    ? searchedMovies.map((movie) => (
                        <div key={movie.movieId} className="group">
                          <div className="bg-[#1d2027] rounded-lg overflow-hidden hover:bg-[#252932] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                            <Link href={`/movie/${movie.movieId}`}>
                              <div
                                className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover transform group-hover:scale-105 transition-transform duration-300"
                                style={{
                                  backgroundImage: `url("${movie?.posterUrl || "/placeholder.jpg"}")`,
                                }}
                              >
                                {/* {movie.status !== "published" && (
                                <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 m-2 rounded inline-block">
                                  {movie.status}
                                </div>
                              )} */}
                              </div>
                            </Link>
                            <div className="p-3">
                              <Link href={`/movie/${movie.movieId}`}>
                                <h3 className="text-white text-sm font-medium truncate hover:text-purple-400 transition-colors">
                                  {movie.title}
                                </h3>
                              </Link>
                              <p className="text-xs">Score: {movie?.score}</p>
                              {/* <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-400 fill-current" />
                                <span className="text-gray-300 text-xs font-medium">
                                  {movie.avgRating?.toFixed(1) ||
                                    movie.rating?.toFixed(1) ||
                                    "N/A"}
                                </span>
                              </div>
                              <span className="text-gray-500 text-xs">
                                {movie.year}
                              </span>
                            </div>
                            {movie.trending && (
                              <div className="flex items-center gap-1 mt-2 text-green-400">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-xs">Trending</span>
                              </div>
                            )} */}
                              <div className="flex gap-1 mt-3">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                                  asChild
                                >
                                  <Link href={`/movie/${movie.movieId}/rate`}>
                                    <Star className="h-3 w-3 mr-1" />
                                    Rate
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs h-7 bg-transparent"
                                  asChild
                                >
                                  <Link href={`/movie/${movie.movieId}`}>
                                    <Play className="h-3 w-3 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : filteredMovies?.map((movie) => (
                        <div key={movie._id} className="group">
                          <div className="bg-[#1d2027] rounded-lg overflow-hidden hover:bg-[#252932] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                            <Link href={`/movie/${movie._id}`}>
                              <div
                                className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover transform group-hover:scale-105 transition-transform duration-300"
                                style={{
                                  backgroundImage: `url("${movie.posterUrl || "/placeholder.jpg"}")`,
                                }}
                              >
                                {movie.status !== "published" && (
                                  <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 m-2 rounded inline-block">
                                    {movie.status}
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="p-3">
                              <Link href={`/movie/${movie._id}`}>
                                <h3 className="text-white text-sm font-medium truncate hover:text-purple-400 transition-colors">
                                  {movie.title}
                                </h3>
                              </Link>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                                  <span className="text-gray-300 text-xs font-medium">
                                    {movie.avgRating?.toFixed(1) ||
                                      movie.rating?.toFixed(1) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {movie.year}
                                </span>
                              </div>
                              {movie.trending && (
                                <div className="flex items-center gap-1 mt-2 text-green-400">
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="text-xs">Trending</span>
                                </div>
                              )}
                              <div className="flex gap-1 mt-3">
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
                                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs h-7 bg-transparent"
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
              ) : (
                <div className="text-center py-16">
                  <Film className="text-gray-400 text-6xl mb-4 mx-auto" />
                  <h3 className="text-white text-xl font-semibold mb-2">
                    No movies found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                  </p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("");
                      setSelectedYear("");
                      setSelectedRating("");
                      setSelectedStatus("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8 mt-10">
              {/* Recently Rated Section */}
              <section>
                {recentlyRatedMovies && recentlyRatedMovies?.length > 0 && (
                  <h2 className="text-white text-2xl font-bold leading-tight tracking-tight mb-4">
                    Recently Rated
                  </h2>
                )}
                {!recentlyRatedMovies ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {[...Array(5)].map((_, i) => (
                      <MovieSkeleton key={i} />
                    ))}
                  </div>
                ) : recentlyRatedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {recentlyRatedMovies.map(
                      (movie: any) =>
                        movie && (
                          <Link
                            key={movie._id}
                            href={`/movie/${movie._id}`}
                            className="group"
                          >
                            <div className="flex flex-col gap-3">
                              <div
                                className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300"
                                style={{
                                  backgroundImage: `url("${movie?.posterUrl || "/placeholder.jpg"}")`,
                                }}
                              />
                              <p className="text-white text-sm sm:text-base font-medium truncate">
                                {movie?.title}
                              </p>
                            </div>
                          </Link>
                        ),
                    )}
                  </div>
                ) : null}
              </section>

              {/* Trending Movies Section */}
              <section>
                <h2 className="text-white text-2xl font-bold leading-tight tracking-tight mb-4">
                  Trending Movies
                </h2>
                {!trendingMovies ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {[...Array(10)].map((_, i) => (
                      <MovieSkeleton key={i} />
                    ))}
                  </div>
                ) : trendingMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {trendingMovies.slice(0, 10).map((movie) => (
                      <Link
                        key={movie._id}
                        href={`/movie/${movie._id}`}
                        className="group"
                      >
                        <div className="flex flex-col gap-3">
                          <div
                            className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300"
                            style={{
                              backgroundImage: `url("${movie.posterUrl || "/placeholder.jpg"}")`,
                            }}
                          >
                            <div className="bg-gradient-to-t from-black/80 to-transparent h-full w-full flex items-end p-2">
                              <div className="flex items-center gap-1 text-green-400">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-xs font-bold">
                                  Trending
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-white text-sm sm:text-base font-medium truncate">
                            {movie.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No trending movies at the moment
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
