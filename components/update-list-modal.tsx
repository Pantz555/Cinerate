"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

// Define the shape of a list item from getUserLists query
interface ListDetails {
  _id: Id<"lists">;
  name: string;
  description?: string;
  isPublic: boolean;
}

interface UpdateListModalProps {
  list: ListDetails;
  trigger?: React.ReactNode;
}

export function UpdateListModal({ list, trigger }: UpdateListModalProps) {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [description, setDescription] = useState(list.description || "");
  const [isPublic, setIsPublic] = useState(list.isPublic);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateList = useMutation(api.lists.update);

  // Sync internal state with props when modal opens (or list prop changes)
  useEffect(() => {
    setListName(list.name);
    setDescription(list.description || "");
    setIsPublic(list.isPublic);
  }, [list]);

  const handleUpdate = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    setIsUpdating(true);
    try {
      await updateList({
        listId: list._id,
        name: listName.trim(),
        description: description.trim() || undefined,
        isPublic,
      });

      toast.success("List updated successfully!");
      setOpen(false); // Close modal on success
    } catch (error: any) {
      console.error("Failed to update list:", error);
      toast.error(error.message || "Failed to update list. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            Edit List
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Make changes to your list details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="list-name" className="text-sm font-medium">
              List Name
            </Label>
            <Input
              id="list-name"
              placeholder="e.g., Summer Blockbusters"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 text-foreground dark:placeholder:text-gray-500 focus:border-blue-500"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 text-foreground dark:placeholder:text-gray-500 focus:border-blue-500 min-h-[100px] resize-none"
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-card dark:g-gray-800/50 rounded-lg border dark:border-gray-700 border-border">
            <div className="space-y-0.5">
              <Label
                htmlFor="public-toggle"
                className="text-sm font-medium cursor-pointer"
              >
                Make list public
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow others to view and discover your list
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="data-[state=checked]:bg-blue-600"
              disabled={isUpdating}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!listName.trim() || isUpdating}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
