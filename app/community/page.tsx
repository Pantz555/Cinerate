"use client";

import { Header } from "@/components/header";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery, usePaginatedQuery } from "convex/react";
import { ThumbsUp, MessageCircle, Share, Star, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function CommunityPage() {
  const [showReplyForm, setShowReplyForm] =
    useState<Id<"communityReviews"> | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<
    Set<Id<"communityReviews">>
  >(new Set());

  // Fetch community reviews with pagination
  const {
    results: reviews,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.communityReviews.getCommunityReviews,
    {},
    { initialNumItems: 5 },
  );

  // Get user's likes for the fetched reviews
  const reviewIds = reviews?.map((review) => review._id) || [];
  const userLikes = useQuery(
    api.communityReviews.getUserLikes,
    reviewIds.length > 0 ? { reviewIds } : "skip",
  );

  // Get replies for all expanded reviews
  const expandedReviewIds = Array.from(expandedReplies);
  const allReplies = useQuery(
    api.communityReviews.getMultipleReviewReplies,
    expandedReviewIds.length > 0 ? { reviewIds: expandedReviewIds } : "skip",
  );

  // Get hot movies
  const hotMovies = useQuery(api.communityReviews.getHotMovies, { limit: 5 });

  // Get recent activity
  const recentActivity = useQuery(api.communityReviews.getRecentActivity, {
    limit: 5,
  });

  // Mutations
  const likeReview = useMutation(api.communityReviews.likeReview);
  const addReply = useMutation(api.communityReviews.addReplyToReview);

  const handleLike = async (reviewId: Id<"communityReviews">) => {
    try {
      const result = await likeReview({ reviewId });
      // Optimistic UI update would happen automatically via Convex reactivity
    } catch (error: any) {
      toast.error(error.message || "Failed to like review");
      console.error(error);
    }
  };

  const handleReplySubmit = async (reviewId: Id<"communityReviews">) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      await addReply({
        reviewId,
        content: replyText.trim(),
      });
      setReplyText("");
      setShowReplyForm(null);

      // Auto-expand replies to show the new reply
      setExpandedReplies((prev) => new Set(prev).add(reviewId));

      toast.success("Reply posted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to post reply");
      console.error(error);
    }
  };

  const toggleReplies = (reviewId: Id<"communityReviews">) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "now";
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 flex-col border-r border-[#292d38] p-4 lg:flex">
          <nav className="flex flex-1 flex-col gap-1">
            <Link
              className="flex items-center gap-3 rounded-md bg-[#292d38] px-3 py-2 text-sm font-semibold text-white"
              href="/"
            >
              <span className="text-xl">🏠</span>
              Home
            </Link>
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#292d38] hover:text-white"
              href="/discover"
            >
              <span className="text-xl">🔍</span>
              Explore
            </a>
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#292d38] hover:text-white"
              href="/lists"
            >
              <span className="text-xl">📋</span>
              Lists
            </a>
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#292d38] hover:text-white"
              href="/reviews"
            >
              <span className="text-xl">🎬</span>
              Reviews
            </a>
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#292d38] hover:text-white"
              href="/watchlist"
            >
              <span className="text-xl">🔖</span>
              Watchlist
            </a>
          </nav>
          <div className="mt-auto">
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#292d38] hover:text-white"
              href="/settings"
            >
              <span className="text-xl">⚙️</span>
              Settings
            </a>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Community Feed
            </h1>

            {/* Hot Movies Section */}
            {hotMovies === undefined ? (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  🔥 Hot Movies
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-[#292d38]"></div>
                      <div className="space-y-1">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-[#292d38]"></div>
                        <div className="h-2 w-1/2 animate-pulse rounded bg-[#292d38]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  🔥 Hot Movies
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {hotMovies.length > 0 ? (
                    hotMovies.map((movie) => (
                      <div
                        key={movie._id}
                        className="group flex cursor-pointer flex-col gap-3"
                      >
                        <div className="relative w-full overflow-hidden rounded-md bg-[#292d38] shadow-lg transition-transform group-hover:scale-105">
                          <div
                            className="aspect-[2/3] w-full bg-cover bg-center bg-no-repeat"
                            style={{
                              backgroundImage: movie.posterUrl
                                ? `url("${movie.posterUrl}")`
                                : `url("/placeholder.svg?height=300&width=200")`,
                            }}
                          ></div>
                        </div>
                        <div>
                          <p className="truncate text-sm font-semibold text-white">
                            {movie.title}
                          </p>
                          <p className="text-xs text-[#9ea4b7]">
                            {movie.genre}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No hot movies at the moment</p>
                  )}
                </div>
              </section>
            )}

            {/* Main Content Grid */}
            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Community Reviews */}
              <section className="md:col-span-2">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  Community Reviews
                </h2>

                {status === "LoadingFirstPage" ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-md border border-[#292d38] p-4"
                      >
                        <div className="animate-pulse">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-[#292d38]"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 bg-[#292d38] rounded"></div>
                              <div className="h-3 w-full bg-[#292d38] rounded"></div>
                              <div className="h-3 w-3/4 bg-[#292d38] rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => {
                      const isLiked = userLikes?.includes(review._id) || false;
                      const repliesExpanded = expandedReplies.has(review._id);
                      const replies = allReplies?.[review._id] || [];

                      return (
                        <div
                          key={review._id}
                          className="rounded-md border border-[#292d38] p-4"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="size-10 shrink-0 rounded-full bg-[#292d38] bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: review.user.image
                                  ? `url("${review.user.image || "/user.png"}")`
                                  : undefined,
                              }}
                            >
                              {!review.user.image && (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                                  {review.user.name?.charAt(0)?.toUpperCase() ||
                                    "A"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {review.user.name}
                                </p>
                                <p className="text-xs text-[#9ea4b7]">
                                  {formatTimeAgo(review.createdAt)}
                                </p>
                                {review.movie.title && (
                                  <Link
                                    href={`/movie/${review.movieId}`}
                                    className="text-xs text-blue-400"
                                  >
                                    · {review.movie.title}
                                  </Link>
                                )}
                                {review.isEdited && (
                                  <p className="text-xs text-gray-500">
                                    · edited
                                  </p>
                                )}
                              </div>

                              {/* Review title and rating */}
                              <div className="mt-1 flex items-center gap-2">
                                <h3 className="text-sm font-medium text-white">
                                  {review.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-yellow-400">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>

                              <p className="mt-2 text-sm text-gray-300">
                                {review.content}
                              </p>

                              {review.spoilerWarning && (
                                <div className="mt-2">
                                  <span className="rounded bg-red-600 px-2 py-1 text-xs text-white">
                                    Contains Spoilers
                                  </span>
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-4 text-xs text-[#9ea4b7]">
                                <button
                                  className={`flex items-center gap-1 transition-colors hover:text-white ${
                                    isLiked ? "text-blue-600" : ""
                                  }`}
                                  onClick={() => handleLike(review._id)}
                                >
                                  <ThumbsUp
                                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                                  />
                                  {review.likesCount}
                                </button>
                                <button
                                  className="flex items-center gap-1 transition-colors hover:text-white"
                                  onClick={() => toggleReplies(review._id)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  {review.repliesCount}
                                </button>
                                <button
                                  className="flex items-center gap-1 transition-colors hover:text-white"
                                  onClick={() =>
                                    setShowReplyForm(
                                      showReplyForm === review._id
                                        ? null
                                        : review._id,
                                    )
                                  }
                                >
                                  Reply
                                </button>
                                <button className="flex items-center gap-1 transition-colors hover:text-white">
                                  <Share className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Existing Replies */}
                          {repliesExpanded && replies.length > 0 && (
                            <div className="mt-4 ml-14 space-y-3 border-l border-[#292d38] pl-4">
                              {replies.map((reply) => (
                                <div
                                  key={reply._id}
                                  className="flex items-start gap-3"
                                >
                                  <div
                                    className="size-8 shrink-0 rounded-full bg-[#292d38] bg-cover bg-center bg-no-repeat"
                                    style={{
                                      backgroundImage: reply.user.image
                                        ? `url("${reply.user.image}")`
                                        : undefined,
                                    }}
                                  >
                                    {!reply.user.image && (
                                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                                        {reply.user.name
                                          ?.charAt(0)
                                          ?.toUpperCase() || "A"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <p className="text-xs font-semibold text-white">
                                        {reply.user.name}
                                      </p>
                                      <p className="text-xs text-[#9ea4b7]">
                                        {formatTimeAgo(reply.createdAt)}
                                      </p>
                                      {reply.isEdited && (
                                        <p className="text-xs text-gray-500">
                                          · edited
                                        </p>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-300">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {showReplyForm === review._id && (
                            <div className="mt-4 ml-14">
                              <div className="flex gap-3">
                                <div className="size-8 shrink-0 rounded-full bg-[#292d38]"></div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                      setReplyText(e.target.value)
                                    }
                                    placeholder="Write a reply..."
                                    className="w-full resize-none rounded-md border border-[#292d38] bg-[#1a1d23] p-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                    rows={2}
                                    maxLength={1000}
                                  />
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {replyText.length}/1000
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setShowReplyForm(null);
                                          setReplyText("");
                                        }}
                                        className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleReplySubmit(review._id)
                                        }
                                        disabled={!replyText.trim()}
                                        className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        <Send className="h-3 w-3" />
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Load More Button */}
                    {status === "CanLoadMore" && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => loadMore(5)}
                          className="rounded-md bg-[#292d38] px-4 py-2 text-sm text-white hover:bg-[#3a3f4a]"
                        >
                          Load More Reviews
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No reviews found. Be the first to write one!
                    </p>
                  </div>
                )}
              </section>

              {/* Recent Activity Sidebar */}
              <aside className="md:col-span-1">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  Recent Activity
                </h2>
                <div className="flex flex-col gap-4">
                  {recentActivity
                    ? recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 shrink-0 overflow-hidden rounded-md bg-[#292d38]">
                            <div
                              className="aspect-[2/3] w-full bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: activity.posterUrl
                                  ? `url("${activity.posterUrl}")`
                                  : `url("/placeholder.svg?height=72&width=48")`,
                              }}
                            ></div>
                          </div>
                          <div>
                            <Link
                              href={`/movie/${activity.movieId}`}
                              className="truncate text-sm font-semibold text-white hover:text-blue-500 transition-all duration-300"
                            >
                              {activity.title}
                            </Link>
                            <p className="text-xs text-[#9ea4b7]">
                              <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" />{" "}
                              Rated {activity.rating}/5
                            </p>
                          </div>
                        </div>
                      ))
                    : // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 h-16 shrink-0 animate-pulse rounded-md bg-[#292d38]"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-[#292d38]"></div>
                            <div className="h-2 w-1/2 animate-pulse rounded bg-[#292d38]"></div>
                          </div>
                        </div>
                      ))}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
