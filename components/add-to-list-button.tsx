"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2, List } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CreateListModal } from "./create-list-modal";
import { toast } from "sonner";

interface AddToListButtonProps {
  movieId: Id<"movies">;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToListButton({
  movieId,
  variant = "outline",
  size = "default",
}: AddToListButtonProps) {
  const [open, setOpen] = useState(false);
  const [processingListId, setProcessingListId] = useState<Id<"lists"> | null>(
    null,
  );

  const lists = useQuery(api.lists.getUserLists);
  const movieLists = useQuery(api.lists.isMovieInLists, { movieId });
  const addMovie = useMutation(api.lists.addMovie);
  const removeMovie = useMutation(api.lists.removeMovie);

  const isInList = (listId: Id<"lists">) => {
    return movieLists?.some((l) => l.id === listId);
  };

  const handleToggleList = async (listId: Id<"lists">) => {
    setProcessingListId(listId);
    try {
      if (isInList(listId)) {
        await removeMovie({ listId, movieId });
        toast.success("Removed from list");
      } else {
        await addMovie({ listId, movieId });
        toast.success("Added to list");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update list");
    } finally {
      setProcessingListId(null);
    }
  };

  const totalInLists = movieLists?.length || 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          {totalInLists > 0 ? (
            <>
              <Check className="h-4 w-4" />
              In {totalInLists} {totalInLists === 1 ? "list" : "lists"}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to List
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-gray-900 border-gray-800"
      >
        {lists === undefined ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        ) : lists.length === 0 ? (
          <div className="py-4 px-2 text-center text-gray-400 text-sm">
            <List className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="mb-3">No lists yet</p>
            <CreateListModal
              trigger={
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                  onClick={() => setOpen(false)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase">
              Add to list
            </div>
            {lists.map((list) => {
              const inList = isInList(list._id);
              const isProcessing = processingListId === list._id;

              return (
                <DropdownMenuItem
                  key={list._id}
                  onClick={() => handleToggleList(list._id)}
                  disabled={isProcessing}
                  className="flex items-center justify-between cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <span className="flex items-center gap-2">
                    {inList && <Check className="h-4 w-4 text-green-500" />}
                    <span className={inList ? "font-medium" : ""}>
                      {list.name}
                    </span>
                  </span>
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-gray-800" />
            <CreateListModal
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </DropdownMenuItem>
              }
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
