"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, Edit, Trash2, Eye, Clock, User, RefreshCw } from "lucide-react";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

const RecentActivityCard = () => {
  const {
    data: activities,
    isPending,
    error,
  } = useQueryWithStatus(api.activities.getAdminActivities, { limit: 10 });

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
        return <Clock className="h-4 w-4 text-gray-400" />;
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
        return "bg-green-600 text-white";
      case "draft":
        return "bg-yellow-600 text-white";
      case "archived":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
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

  if (error) {
    return (
      <Card className="bg-[#1a1d23] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
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
    <Card className="bg-[#1a1d23] border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
          disabled={isPending}
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 animate-pulse"
              >
                <div className="w-12 h-16 bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.activityType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium leading-relaxed">
                      {getActivityMessage(activity)}
                    </p>
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-500 text-xs">
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
                        <span className="text-gray-400 text-xs">→</span>
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
                      className="w-8 h-12 object-cover rounded border border-gray-600"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No recent activity
            </h3>
            <p className="text-gray-500 text-sm">
              Recent admin actions will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
