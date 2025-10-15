"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Film,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const RecentActivityCard = () => {
  const {
    data: activities,
    isPending,
    error,
  } = useQueryWithStatus(api.activities.getAdminActivities, { limit: 10 });

  const deleteAdminActivities = useMutation(
    api.activities.deleteAllAdminActivities,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "movie_created":
        return <Film className="h-4 w-4 text-green-400" />;
      case "movie_updated":
        return <Edit className="h-4 w-4 text-blue-400" />;
      case "movie_deleted":
        return <Trash2 className="h-4 w-4 text-red-400" />;
      case "movie_status_changed":
        return <Eye className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    const { activityType, metadata, actor } = activity;
    const actorName = actor?.name || "Admin";
    const movieTitle = metadata?.movieTitle || "Unknown Movie";

    switch (activityType) {
      case "movie_created":
        return `${actorName} created "${movieTitle}"`;
      case "movie_updated":
        return `${actorName} updated "${movieTitle}"`;
      case "movie_deleted":
        return `${actorName} deleted "${movieTitle}"`;
      case "movie_status_changed":
        return `${actorName} changed "${movieTitle}" status from ${metadata?.oldStatus} to ${metadata?.newStatus}`;
      default:
        return `${actorName} performed an action on "${movieTitle}"`;
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-600 text-foreground";
      case "draft":
        return "bg-yellow-600 text-foreground";
      case "archived":
        return "bg-red-600 text-foreground";
      default:
        return "bg-gray-600 text-foreground";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAdminActivities({});
      toast.success(`${res.deleted} admin activities deleted`);
      setIsDeleting(false);
    } catch (err) {
      toast.error("Failed to delete admin activities");
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <Card className="dark:bg-[#1a1d23] dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">
              Error loading activities: {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="dark:bg-[#1a1d23] dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            {activities?.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-white"
                    disabled={isPending}
                  >
                    <Trash2
                      className={`h-4 w-4 ${isPending ? "animate-pulse" : ""}`}
                    />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-[#1a1d23] dark:border-gray-700 text-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Delete Movie
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Are you sure you want to delete all activities logs? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={isDeleting}
                      className="dark:border-gray-600 text-foreground dark:hover:bg-gray-700 bg-transparent"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="shrink-0 size-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              size="sm"
              variant="outline"
              className="border-border dark:border-gray-600 text-foreground dark:hover:bg-gray-700 bg-transparent"
              disabled={isPending}
            >
              <RefreshCw
                className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-accent dark:bg-gray-800/30 animate-pulse"
                >
                  <div className="w-12 h-16 bg-accent dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-accent dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-accent dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-accent dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-4 p-3 rounded-lg bg-accent hover:bg-accent/90 dark:bg-gray-800/30 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.activityType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground text-sm font-medium leading-relaxed">
                        {getActivityMessage(activity)}
                      </p>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {activity.actor?.email || "Unknown"}
                      </span>
                    </div>

                    {/* Show status badges for status changes */}
                    {activity.activityType === "movie_status_changed" &&
                      activity.metadata && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={`text-xs ${getStatusBadgeColor(activity.metadata.oldStatus)}`}
                          >
                            {activity.metadata.oldStatus}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            →
                          </span>
                          <Badge
                            className={`text-xs ${getStatusBadgeColor(activity.metadata.newStatus)}`}
                          >
                            {activity.metadata.newStatus}
                          </Badge>
                        </div>
                      )}
                  </div>

                  {/* Movie poster thumbnail */}
                  {activity.metadata?.posterUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={activity.metadata.posterUrl}
                        alt="Movie poster"
                        width={32}
                        height={48}
                        className="w-8 h-12 object-cover rounded border dark:border-gray-600 border-border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No recent activity
              </h3>
              <p className="text-muted-foreground text-sm">
                Recent admin actions will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RecentActivityCard;
