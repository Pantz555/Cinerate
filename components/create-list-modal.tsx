"use client";

import type React from "react";
import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useQuery } from "convex-helpers/react/cache";

interface CreateListModalProps {
  trigger?: React.ReactNode;
}

export function CreateListModal({ trigger }: CreateListModalProps) {
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const createList = useMutation(api.lists.create);

  const handleCreate = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to create list!");
      return;
    }

    setIsCreating(true);
    try {
      await createList({
        name: listName.trim(),
        description: description.trim() || undefined,
        isPublic,
      });

      toast.success("List created successfully!");

      // Reset form and close modal
      setListName("");
      setDescription("");
      setIsPublic(false);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create list:", error);
      toast.error("Failed to create list. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New List
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Create New List
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Organize your favorite movies into a custom collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="list-name"
              className="text-white text-sm font-medium"
            >
              List Name
            </Label>
            <Input
              id="list-name"
              placeholder="e.g., Summer Blockbusters"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-white text-sm font-medium"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 min-h-[100px] resize-none"
              disabled={isCreating}
            />
          </div>

          {/* <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="space-y-0.5">
              <Label
                htmlFor="public-toggle"
                className="text-white text-sm font-medium cursor-pointer"
              >
                Make list public
              </Label>
              <p className="text-xs text-gray-400">
                Allow others to view and discover your list
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="data-[state=checked]:bg-blue-600"
              disabled={isCreating}
            />
          </div> */}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!listName.trim() || isCreating}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
