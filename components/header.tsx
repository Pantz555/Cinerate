"use client";

import Link from "next/link";
import { CineRateIcon } from "@/components/icons";
import HeaderActions from "./header-actions";
import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useDebouncedValue } from "@mantine/hooks";
import { StructuredMovies } from "@/lib/types";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced] = useDebouncedValue(searchQuery, 200);
  const [searchedMovies, setSearchedMovies] = useState<StructuredMovies | []>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchMovie = useAction(api.rag.searchEmbedMovie);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsSearching(true);
      const data = await searchMovie({ query: debounced });
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
      setSearched(true);
    };
    if (debounced.trim()) {
      fetch();
    } else {
      setSearchedMovies([]);
      setIsSearching(false);
    }
  }, [debounced, searchMovie]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 text-white">
        <div className="h-8 w-8 text-[var(--primary-500)]">
          <CineRateIcon className="h-full w-full" />
        </div>
        <Link href="/">
          <h2 className="text-xl font-bold tracking-tight text-foreground hover:text-foreground/80 transition-colors">
            CineRate
          </h2>
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-6">
        {["Home", "Discover", "Lists", "Community"].map((item) => (
          <Link
            key={item}
            href={`/${item === "Home" ? "" : item.toLowerCase()}`}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {item}
          </Link>
        ))}
      </nav>

      {/* Right: Actions + Search */}
      <div className="flex items-center gap-3 relative">
        {/* Search Icon (Mobile) */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden text-foreground hover:text-primary transition"
          aria-label="Toggle search"
        >
          {searchOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>

        {/* Inline Search (Desktop) */}
        <div className="hidden md:flex flex-col items-end relative">
          <div
            className={cn(
              "flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-1.5 w-64 transition-all",
              searchQuery && "ring-1 ring-primary",
            )}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              className="bg-transparent border-none focus-visible:ring-0 text-sm text-foreground shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop Search Results */}
          {searchQuery && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto">
              {isSearching && (
                <div className="flex justify-center items-center py-4 text-muted-foreground">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Searching...
                </div>
              )}

              {!isSearching && searched && searchedMovies.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No movies found for “{searchQuery}”
                </div>
              )}

              {!isSearching &&
                searchedMovies.slice(0, 8).map((movie) => (
                  <Link
                    key={movie.movieId}
                    href={`/movie/${movie.movieId}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition"
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No Img
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {movie.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {movie.score}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <HeaderActions />
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-t border-border p-4 md:hidden">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-muted/40 border-border text-foreground"
            />
            <Button
              type="button"
              className="bg-primary text-primary-foreground"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Results / States */}
          <div className="mt-4 space-y-2">
            {isSearching && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Searching...
              </div>
            )}

            {!isSearching && searched && searchedMovies.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No movies found for “{searchQuery}”
              </div>
            )}

            {!isSearching &&
              searchedMovies.slice(0, 5).map((movie) => (
                <Link
                  key={movie.movieId}
                  href={`/movie/${movie.movieId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition"
                >
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-10 h-14 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No Img
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {movie.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Score: {movie.score}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
