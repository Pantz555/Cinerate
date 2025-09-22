"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  TrendingUp,
  Clock,
  Award,
  Heart,
  Filter,
  Film,
  Play,
  Sparkles,
} from "lucide-react";
import { useQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { useDebouncedValue } from "@mantine/hooks";
import { StructuredMovies } from "@/lib/types";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const { data, isPending: featuredLoading } = useQuery(
    api.movies.getMoviesWithFilters,
    {
      featured: true,
      sortBy: "highest",
    },
  );
  const searchMovie = useAction(api.rag.searchEmbedMovie);
  const [debounced] = useDebouncedValue(searchQuery, 200);
  const [searchedMovies, setSearchedMovies] = useState<StructuredMovies | []>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  // Get personalized picks based on user ratings
  const { data: personalizedPicks, isPending: personalizedLoading } = useQuery(
    api.movies.getPersonalizedPicks,
    { limit: 8 },
  );

  // Get user preferences for display
  const { data: userPreferences } = useQuery(api.movies.getUserPreferences, {});

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

  const { data: filteredMovies, isPending: filteredMoviesLoading } = useQuery(
    api.movies.getMoviesWithFilters,
    {
      genre: selectedGenre || undefined,
      year: selectedYear || undefined,
      minRating: selectedRating
        ? parseFloat(selectedRating.replace("+", ""))
        : undefined,
    },
  );

  const currentMovies = debounced.trim()
    ? searchedMovies
    : (filteredMovies ?? []);
  const moviesLength = currentMovies.length;

  const featuredMovie = data ? data[0] : null;

  // Trending
  const { data: trendingMovies, isPending: trendingLoading } = useQuery(
    api.movies.getMoviesWithFilters,
    {
      sortBy: "trending",
    },
  );

  // New releases
  const { data: newReleases, isPending: newReleasedLoading } = useQuery(
    api.movies.getMoviesWithFilters,
    {
      isNew: true,
      sortBy: "recent",
    },
  );

  // By category (example: Sci-Fi)
  const { data: sciFiMovies, isPending: scifiLoading } = useQuery(
    api.movies.getMoviesWithFilters,
    {
      genre: "sci-fi",
    },
  );
  const { data: hiddenGems, isPending: hiddenGenLoading } = useQuery(
    api.movies.getHiddenGems,
  );

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
    selectedRating;

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
    <div className="relative flex min-h-screen w-full flex-col bg-[#111317]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          {/* Hero Section with Featured Movie */}
          {featuredMovie && (
            <section className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold text-sm">
                      Featured Movie
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {featuredMovie?.title}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-gray-300">{featuredMovie.year}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-white font-semibold">
                        {featuredMovie.avgRating}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {featuredMovie.description}
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/movie/${featuredMovie._id}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                        <Star className="mr-2 h-5 w-5" />
                        Rate Now
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3 bg-transparent hover:text-gray-300"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="w-64 h-96 rounded-lg overflow-hidden shadow-2xl">
                    <img
                      src={featuredMovie?.posterUrl || "/placeholder.svg"}
                      alt={featuredMovie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}
          {/* Search and Filters */}
          <section className="mb-8">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  className="w-full rounded-lg border-none bg-[#1d2027] h-12 placeholder:text-gray-400 text-white pl-12 pr-4"
                  placeholder="Search for movies, directors, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">
                    Filters:
                  </span>
                </div>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-[120px] h-9 bg-[#1d2027] border-none text-white">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d2027] border-gray-600">
                    <SelectItem
                      value="action"
                      className="text-white hover:bg-gray-700"
                    >
                      Action
                    </SelectItem>
                    <SelectItem
                      value="drama"
                      className="text-white hover:bg-gray-700"
                    >
                      Drama
                    </SelectItem>
                    <SelectItem
                      value="comedy"
                      className="text-white hover:bg-gray-700"
                    >
                      Comedy
                    </SelectItem>
                    <SelectItem
                      value="sci-fi"
                      className="text-white hover:bg-gray-700"
                    >
                      Sci-Fi
                    </SelectItem>
                    <SelectItem
                      value="horror"
                      className="text-white hover:bg-gray-700"
                    >
                      Horror
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-9 bg-[#1d2027] border-none text-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d2027] border-gray-600">
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
                  </SelectContent>
                </Select>

                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger className="w-[110px] h-9 bg-[#1d2027] border-none text-white">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d2027] border-gray-600">
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
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleRandomMovie}
                  disabled={moviesLength === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white h-9"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Surprise Me
                </Button>
              </div>
            </div>
          </section>

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
                  selectedRating) && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("");
                      setSelectedYear("");
                      setSelectedRating("");
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
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Trending Now */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                  <h2 className="text-white text-2xl font-bold">
                    Trending Now
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {trendingLoading ? (
                    [...Array(5)].map((_, i) => <MovieSkeleton key={i} />)
                  ) : trendingMovies && trendingMovies?.length > 0 ? (
                    trendingMovies?.map((movie) => (
                      <Link
                        key={movie._id}
                        href={`/movie/${movie._id}`}
                        className="group"
                      >
                        <div className="relative">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={movie.posterUrl || "/placeholder.svg"}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            TRENDING
                          </div>
                          <div className="mt-3">
                            <h3 className="text-white font-medium text-sm truncate">
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-gray-300 text-sm">
                                {movie.avgRating || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No trending movies at the moment
                    </p>
                  )}
                </div>
              </section>
              {/* New Releases */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-6 w-6 text-green-500" />
                  <h2 className="text-white text-2xl font-bold">
                    New Releases
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {newReleasedLoading ? (
                    [...Array(5)].map((_, i) => <MovieSkeleton key={i} />)
                  ) : newReleases && newReleases.length > 0 ? (
                    newReleases?.map((movie) => (
                      <Link
                        key={movie._id}
                        href={`/movie/${movie._id}`}
                        className="group"
                      >
                        <div className="relative">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={movie.posterUrl || "/placeholder.svg"}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            NEW
                          </div>
                          <div className="mt-3">
                            <h3 className="text-white font-medium text-sm truncate">
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-gray-300 text-sm">
                                {movie.avgRating || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No new released movies at the moment
                    </p>
                  )}
                </div>
              </section>
              {/* Genre Categories */}
              <section className="mb-12">
                <h2 className="text-white text-2xl font-bold mb-6">
                  Sci-Fi Movies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {scifiLoading ? (
                    [...Array(5)].map((_, i) => <MovieSkeleton key={i} />)
                  ) : sciFiMovies && sciFiMovies.length > 0 ? (
                    sciFiMovies?.map((movie) => (
                      <Link
                        key={movie._id}
                        href={`/movie/${movie._id}`}
                        className="group"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={movie.posterUrl || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="mt-3">
                          <h3 className="text-white font-medium text-sm truncate">
                            {movie.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-gray-300 text-sm">
                              {movie.avgRating || "N/A"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No Sci-fi movies at the moment
                    </p>
                  )}
                </div>
              </section>
              {/* Hidden Gems */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-purple-500" />
                  <h2 className="text-white text-2xl font-bold">Hidden Gems</h2>
                  <span className="text-gray-400 text-sm">
                    Highly rated with fewer reviews
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {hiddenGenLoading ? (
                    [...Array(5)].map((_, i) => <MovieSkeleton key={i} />)
                  ) : hiddenGems && hiddenGems.length > 0 ? (
                    hiddenGems?.map((movie) => (
                      <Link
                        key={movie._id}
                        href={`/movie/${movie._id}`}
                        className="group"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={movie.posterUrl || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="mt-3">
                          <h3 className="text-white font-medium text-sm truncate">
                            {movie.title}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-gray-300 text-sm">
                                {movie.avgRating || "N/A"}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {movie.reviews} reviews
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No hidden gems at the moment
                    </p>
                  )}
                </div>
              </section>
              {/* Personalized Recommendations */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <h2 className="text-white text-2xl font-bold">
                    Based on Your Ratings
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {personalizedPicks && personalizedPicks.length > 0 ? (
                    personalizedPicks?.map((movie) => (
                      <div key={movie._id} className="group">
                        <div className="bg-[#1d2027] rounded-lg overflow-hidden hover:bg-[#252932] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                          <Link href={`/movie/${movie._id}`}>
                            <div
                              className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover transform group-hover:scale-105 transition-transform duration-300 relative"
                              style={{
                                backgroundImage: `url("${movie.posterUrl || "/placeholder.jpg"}")`,
                              }}
                            >
                              {/* Match percentage badge */}
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                {movie?.matchPercentage || 95}% MATCH
                              </div>
                              {/* Sparkles icon for personalized */}
                              <div className="absolute top-2 right-2 text-yellow-400">
                                <Sparkles className="h-4 w-4" />
                              </div>
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
                                  {movie.avgRating?.toFixed(1) || "N/A"}
                                </span>
                              </div>
                              <span className="text-gray-500 text-xs">
                                {movie.year}
                              </span>
                            </div>
                            {/* Match reasons */}
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs truncate">
                                {movie?.matchReasons?.[0] ||
                                  "Based on your preferences"}
                              </p>
                            </div>
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
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No personalized picks for now.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
