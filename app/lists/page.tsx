"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Star,
  Plus,
  Eye,
  Heart,
  Clock,
  Film,
  Loader2,
  Trash2,
} from "lucide-react";
import { CreateListModal } from "@/components/create-list-modal";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { UpdateListModal } from "@/components/update-list-modal";
import { Skeleton } from "@/components/ui/skeleton";

// A simple skeleton component for the loading state
const ListCardSkeleton = () => (
  <div className="rounded-xl border border-border dark:border-gray-800 dark:bg-gray-900/50 bg-background p-6">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-9 w-9 rounded-lg " />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 rounded " />
        <Skeleton className="h-4 w-20 rounded " />
      </div>
    </div>
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        <Skeleton className="w-12 h-16 rounded-md" />
        <Skeleton className="w-12 h-16 rounded-md" />
        <Skeleton className="w-12 h-16 rounded-md" />
      </div>
    </div>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-24 rounded" />
      <Skeleton className="h-4 w-28 rounded" />
    </div>
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

export default function ListsPage() {
  const lists = useQuery(api.lists.getUserLists);
  const [deletingListId, setDeletingListId] = useState<Id<"lists"> | null>(
    null,
  );
  const deleteListMutation = useMutation(api.lists.deleteList);

  const handleDeleteList = async (listId: Id<"lists">, listName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the list "${listName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingListId(listId);
    try {
      await deleteListMutation({ listId });
      toast.success(`List "${listName}" deleted successfully!`);
    } catch (error: any) {
      console.error("Failed to delete list:", error);
      toast.error(error.message || `Failed to delete list "${listName}".`);
    } finally {
      setDeletingListId(null);
    }
  };

  // For visual variety, cycle through icons and colors
  const listIcons = [Heart, Clock, Film, Star, Heart, Film];
  const listColors = [
    "text-red-400",
    "text-blue-400",
    "text-orange-400",
    "text-purple-400",
    "text-pink-400",
    "text-yellow-400",
  ];

  const renderContent = () => {
    // Loading state
    if (lists === undefined) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ListCardSkeleton />
          <ListCardSkeleton />
          <ListCardSkeleton />
        </div>
      );
    }

    // Empty state
    if (lists.length === 0) {
      return (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Create your first custom list
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Organize movies by genre, mood, or any theme you like. Share your
            curated collections with friends.
          </p>
          <CreateListModal
            trigger={
              <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Get Started
              </Button>
            }
          />
        </div>
      );
    }

    // Data loaded state
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list, i) => {
          const IconComponent = listIcons[i % listIcons.length];
          const color = listColors[i % listColors.length];
          const updatedAt = list.updatedAt
            ? formatDistanceToNow(new Date(list.updatedAt), {
                addSuffix: true,
              })
            : "Never updated";
          const isDeleting = deletingListId === list._id; // 👈 Check delete state

          return (
            <div
              key={list._id}
              className="group rounded-xl border border-border dark:border-gray-800 bg-gradient-to-br dark:from-gray-900/50 dark:to-gray-800/30 p-6 transition-all duration-300 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center gap-3 mb-4 justify-between">
                {/* List Icon and Name */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg/50 ${color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                      {list.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {list.count} movies
                    </p>
                  </div>
                </div>

                {/* 👈 EDIT/DELETE BUTTONS */}
                <div className="flex gap-1">
                  <UpdateListModal list={list} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500 dark:hover:bg-gray-700/50 p-1 h-auto"
                    onClick={() => handleDeleteList(list._id, list.name)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {/* END EDIT/DELETE BUTTONS */}
              </div>

              <div className="mb-4">
                <div className="flex gap-2 mb-3">
                  {list.movies.slice(0, 3).map((movie, idx) => (
                    <div
                      key={movie._id ?? idx}
                      className="w-12 h-16 bg-card dark:bg-gray-700 rounded-md flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={
                          movie.posterUrl ||
                          `/placeholder.svg?height=64&width=48&query=movie poster ${movie.title}`
                        }
                        alt={movie.title ?? "Movie poster"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {list.count > 3 && (
                    <div className="w-12 h-16 rounded-md flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{list.count - 3}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-foreground space-y-1">
                  {list.movies.slice(0, 2).map((movie, idx) => (
                    <div key={movie._id ?? idx} className="truncate">
                      {movie.title}
                    </div>
                  ))}
                  {list.count > 2 && (
                    <div className="text-muted-foreground">
                      and {list.count - 2} more...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Avg: {list.avgRating}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {updatedAt}
                </div>
              </div>

              <Link href={`/lists/${list._id}`}>
                <Button
                  variant="outline"
                  className="w-full border-border dark:border-gray-700 bg-transparent text-foreground hover hover:text-foreground/90 hover:border-blue-500 transition-all duration-200 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View List
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-card dark:bg-[#0f1419]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                My Lists
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Organize your favorite movies into custom collections
              </p>
            </div>
            <CreateListModal />
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
