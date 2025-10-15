"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BellIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export default function NotificationMenu() {
  const notifications = useQuery(api.notifications.getUserNotifications, {
    limit: 20,
  });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (
    id: Id<"notifications">,
    isRead: boolean,
  ) => {
    if (!isRead) {
      try {
        await markAsRead({ notificationId: id });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const getNotificationText = (notification: any) => {
    const actorName = notification.actorName || "Someone";

    switch (notification.type) {
      case "new_review":
        return `${actorName} ${notification.action} ${notification.target}`;
      case "rating_response":
        return `${actorName} responded to your rating on ${notification.target}`;
      case "review_like":
        return `${actorName} liked your review on ${notification.target}`;
      case "comment_reply":
        return `${actorName} replied to your comment on ${notification.target}`;
      case "new_follower":
        return `${actorName} started following you`;
      case "achievement_unlocked":
        return `You unlocked the achievement: ${notification.target}`;
      case "trending_movie":
        return `${notification.target} is trending now!`;
      case "recommendation":
        return `New recommendation: ${notification.target}`;
      case "movie_updated":
        return `${notification.target} has been updated`;
      case "movie_deleted":
        return `${notification.target} has been removed`;
      default:
        return `${actorName} ${notification.action} ${notification.target}`;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  if (notifications === undefined || unreadCount === undefined) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="relative size-8 rounded-full text-muted-foreground shadow-none"
        disabled
      >
        <Loader2 size={16} className="animate-spin" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative size-8 rounded-full text-muted-foreground shadow-none"
          aria-label="Open notifications"
        >
          <BellIcon size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 size-1 rounded-full bg-primary"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
        ></div>

        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <div className="relative flex items-start pe-3">
                  <div className="flex-1 space-y-1">
                    <button
                      className="text-left text-foreground/80 after:absolute after:inset-0"
                      onClick={() =>
                        handleNotificationClick(
                          notification._id,
                          notification.isRead,
                        )
                      }
                    >
                      <span className="text-foreground">
                        {getNotificationText(notification)}
                      </span>
                    </button>
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute end-0 self-center">
                      <span className="sr-only">Unread</span>
                      <Dot />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
