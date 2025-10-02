"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Film, Loader2, Check } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useDebouncedValue } from "@mantine/hooks";
import { StructuredMovies } from "@/lib/types";

interface AddMovieToListModalProps {
  listId: Id<"lists">;
  listName: string;
}

export function AddMovieToListModal({
  listId,
  listName,
}: AddMovieToListModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced] = useDebouncedValue(searchQuery, 200);
  const [addingMovieId, setAddingMovieId] = useState<Id<"movies"> | null>(null);
  const [searchedMovies, setSearchedMovies] = useState<StructuredMovies | []>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  const searchMovie = useAction(api.rag.searchEmbedMovie);

  useEffect(() => {
    const fetch = async () => {
      setIsSearching(true);
      const data = await searchMovie({ query: debounced });
      const structuredMovies = data?.results
        .map((result) => {
          const entry = data.entries.find((e) => e.entryId === result.entryId);
          if (!entry) return null;

          return {
            movieId: entry?.metadata?.movieId as Id<"movies">,
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

  const list = useQuery(api.lists.getById, { listId });
  const addMovie = useMutation(api.lists.addMovie);

  const handleAddMovie = async (movieId: Id<"movies">) => {
    setAddingMovieId(movieId);
    try {
      await addMovie({ listId, movieId });
      toast.success("Movie added to list!");
    } catch (error: any) {
      if (error.message?.includes("already in list")) {
        toast.error("Movie is already in this list");
      } else {
        toast.error("Failed to add movie");
      }
      console.error(error);
    } finally {
      setAddingMovieId(null);
    }
  };

  const isMovieInList = (movieId: Id<"movies">) => {
    return list?.movieIds?.includes(movieId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Movies
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Add Movies to {listName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Search for movies to add to your list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {searchQuery.length < 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                <p>Start typing to search for movies</p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
              </div>
            ) : searchedMovies?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Film className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                <p>No movies found</p>
              </div>
            ) : (
              searchedMovies?.map((movie) => {
                const inList = isMovieInList(movie.movieId as Id<"movies">);
                const isAdding = addingMovieId === movie.movieId;

                return (
                  <div
                    key={movie.movieId}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {movie.title}
                      </h4>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddMovie(movie.movieId as Id<"movies">)
                      }
                      disabled={inList || isAdding}
                      className={
                        inList
                          ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 cursor-default"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }
                    >
                      {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : inList ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
