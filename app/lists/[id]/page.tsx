"use client";

import { use, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Star,
  Trash2,
  Plus,
  Film,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { AddMovieToListModal } from "@/components/add-movie-to-list-modal";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for the loading state
const ListDetailSkeleton = () => (
  <div className="">
    {/* Header Skeleton */}
    <div className="mb-8">
      <Skeleton className="h-9 w-36 rounded-md mb-4" />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-md" />
            <Skeleton className="h-6 w-96 rounded-md" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
    {/* Search Skeleton */}
    <Skeleton className="h-10 w-full rounded-md mb-6" />
    {/* Grid Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3]  rounded-lg" />
          <Skeleton className="h-5 w-full  rounded-md" />
          <Skeleton className="h-8 w-full  rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export default function ListDetailPage({ params }: { params: { id: string } }) {
  const { id: listId } = use<any>(params as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingMovieId, setRemovingMovieId] = useState<Id<"movies"> | null>(
    null,
  );

  const list = useQuery(api.lists.getById, listId ? { listId } : "skip");
  const removeMovie = useMutation(api.lists.removeMovie);

  const handleRemoveMovie = async (movieId: Id<"movies">) => {
    if (!listId) return;
    setRemovingMovieId(movieId);
    try {
      await removeMovie({ listId, movieId });
      toast.success("Movie removed from list.");
    } catch (error) {
      console.error("Failed to remove movie:", error);
      toast.error("Failed to remove movie. Please try again.");
    } finally {
      setRemovingMovieId(null);
    }
  };

  // Main render logic starts here
  const renderContent = () => {
    if (list === undefined) {
      return <ListDetailSkeleton />;
    }

    if (list === null) {
      return (
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            List not found
          </h1>
          <Link href="/lists">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
        </div>
      );
    }

    // Filter movies based on search query
    const filteredMovies =
      list.movies?.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ?? [];

    // Using a consistent icon and color for the detail page
    const IconComponent = Film;
    const color = "text-blue-400";

    return (
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lists">
            <Button
              variant="ghost"
              className="dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lists
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl bg-gray-200 dark:bg-gray-800/50 ${color}`}
              >
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                  {list.name}
                </h1>
                {list.description && (
                  <p className="text-lg text-muted-foreground mb-3 max-w-2xl">
                    {list.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>{list.count} movies</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    Avg: {list.avgRating}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-md text-xs font-medium">
                    {list.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            <AddMovieToListModal listId={list._id} listName={list.name} />
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies in this list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-gray-900 border-border dark:border-gray-800 text-foreground placeholder-muted-foreground dark:placeholder:text-gray-500 focus:border-blue-500"
              disabled={!list.movies || list.movies.length === 0}
            />
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMovies.map((movie) => (
              <div
                key={movie._id}
                className="group relative rounded-lg overflow-hidden bg-muted dark:bg-gray-900 border border-border dark:border-gray-800 dark:hover:border-gray-700 transition-all duration-300 flex flex-col"
              >
                <Link href={`/movie/${movie._id}`} className="block">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={movie.posterUrl || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t dark:from-black/80 dark:via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
                <div className="p-3 mt-auto">
                  <Link href={`/movie/${movie._id}`}>
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{movie.year}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-current" />
                      <span className="text-foreground font-medium">
                        {movie.avgRating}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-400 hover:text-red-300 dark:hover:bg-red-950/30 h-7 text-xs"
                    onClick={() => handleRemoveMovie(movie._id)}
                    disabled={removingMovieId === movie._id}
                  >
                    {removingMovieId === movie._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery ? "No movies found" : "No movies in this list yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search query."
                : "Start adding movies to build your collection!"}
            </p>
            {!searchQuery && (
              <AddMovieToListModal listId={list._id} listName={list.name} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background dark:bg-[#0f1419]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pb-20 md:pb-8">
        {renderContent()}
      </main>
    </div>
  );
}
