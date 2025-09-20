"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Star, StarHalf, BookmarkPlus, ThumbsUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "convex-helpers/react";
import MovieDetailsSkeleton from "@/components/skeleton/movie-detatils-skeleton";

export default function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use<any>(params as any);
  const router = useRouter();
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 5,
    cursor: null as string | null,
  });

  const {
    data: movie,
    isPending,
    error,
  } = useQuery(api.movies.getMovieById, {
    movieId: id as Id<"movies">,
  });

  const { data: communityReviews } = useQuery(
    api.communityReviews.getCommunityReviews,
    {
      movieId: id as Id<"movies">,
      paginationOpts,
    },
  );

  const { data: userLikes } = useQuery(api.communityReviews.getUserLikes, {
    reviewIds: communityReviews?.page?.map((r) => r._id) || [],
  });

  const { data: ratingDistribution } = useQuery(
    api.ratings.getRatingDistribution,
    {
      movieId: params.id as Id<"movies">,
    },
  );

  const likeReview = useMutation(api.communityReviews.likeReview);

  // Handle like/unlike action
  const handleLikeReview = async (
    reviewId: Id<"communityReviews">,
    isLiked: boolean,
  ) => {
    if (!userLikes) {
      toast.error("Please log in to like reviews");
      router.push("/login");
      return;
    }

    // Optimistic update
    const review = communityReviews?.page?.find((r) => r._id === reviewId);
    if (review) {
      review.likesCount = isLiked
        ? review.likesCount - 1
        : review.likesCount + 1;
    }

    try {
      const result = await likeReview({ reviewId });
      toast.success(result.liked ? "Review liked!" : "Review unliked!");
    } catch (error) {
      console.error("Failed to like/unlike review:", error);
      toast.error("Error updating like status");
      // Revert optimistic update on error
      if (review) {
        review.likesCount = isLiked
          ? review.likesCount + 1
          : review.likesCount - 1;
      }
    }
  };

  // Loading state
  if (isPending || movie === undefined) {
    return <MovieDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#111317]">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500 text-center">{error}</div>
        </main>
      </div>
    );
  }

  if (movie === null) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#111317]">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-white text-center">Movie not found</div>
        </main>
      </div>
    );
  }

  const { page, isDone, continueCursor } = communityReviews || {};

  const loadMore = () => {
    setPaginationOpts({
      numItems: 6,
      cursor: continueCursor as any,
    });
  };

  const loadPrevious = () => {
    setPaginationOpts({
      numItems: 6,
      cursor: null,
    });
  };

  // Calculate star rating display
  const rating = movie.avgRating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Rating distribution data
  const distribution = ratingDistribution?.distribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#111317]">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-[#9ea4b7] hover:text-white transition-colors font-medium"
            >
              Movies
            </Link>
            <span className="text-[#575e75]">/</span>
            <span className="text-white font-medium">{movie.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <div className="sticky top-28">
              <div className="aspect-[2/3] w-full bg-center bg-no-repeat bg-cover rounded-lg shadow-2xl shadow-black/30 overflow-hidden">
                <Image
                  alt={`${movie.title} Poster`}
                  className="w-full h-full object-cover"
                  src={movie.posterUrl || "/placeholder-poster.jpg"}
                  width={400}
                  height={600}
                />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <Link href={`/movie/${id}/rate`}>
                  <Button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-all text-base">
                    <Star className="h-5 w-5" /> Rate Now
                  </Button>
                </Link>
                <Button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#292d38] text-white font-semibold rounded-md hover:bg-white/10 transition-all text-base">
                  <BookmarkPlus className="h-5 w-5" /> Add to Watchlist
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 flex flex-col gap-10">
            {/* Movie Info Section */}
            <section>
              <div className="flex flex-col gap-2">
                <p className="text-white/80 text-base font-medium">
                  {movie.year} • PG-13 • {movie.duration || "Unknown"}
                </p>
                <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
                  {movie.title}
                </h1>
                <p className="text-white/80 text-base">{movie.genre}</p>
                <p className="text-[#9ea4b7] max-w-3xl mt-2 text-base leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </section>

            <section className="p-6 bg-[#1a1d23] rounded-lg border border-[#292d38]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-[#292d38] pb-6 md:pb-0 md:pr-6 text-center">
                  <p className="text-6xl font-black leading-none text-secondary">
                    {rating.toFixed(1)}
                  </p>
                  <div className="flex text-[#F59E0B]">
                    {Array(fullStars)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={`full-${i}`}
                          className="h-6 w-6 fill-current"
                        />
                      ))}
                    {hasHalfStar && (
                      <StarHalf className="h-6 w-6 fill-current" />
                    )}
                    {Array(emptyStars)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="h-6 w-6 text-[#F59E0B]"
                        />
                      ))}
                  </div>
                  <p className="text-white/70 text-sm font-medium">
                    {movie.reviews || 0} reviews
                  </p>
                </div>
                {/* Dynamic rating distribution */}
                <div className="grid w-full flex-1 grid-cols-[20px_1fr_40px] items-center gap-x-4 gap-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="contents">
                      <p className="text-white text-sm font-medium">{star}</p>
                      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[#3d4252]">
                        <div
                          className="rounded-full bg-[#F59E0B]"
                          style={{ width: `${distribution[star] || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-[#9ea4b7] text-sm font-normal text-right">
                        {distribution[star] ? distribution[star].toFixed(0) : 0}
                        %
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold leading-tight tracking-tight mb-4">
                Reviews
              </h2>
              <div className="flex flex-col gap-6">
                {communityReviews?.page?.length ? (
                  communityReviews.page.map((review) => {
                    const isLiked = userLikes?.includes(review._id);
                    return (
                      <div
                        key={review._id}
                        className="flex flex-col gap-3 border-b border-[#292d38] pb-6"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{
                              backgroundImage: `url(${
                                review?.user?.image ||
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6UwcqaUrDvlTwlgA1mUex0HCVXzwY-g6kvn6l9KE9oPsWP_PLWpXDE5nBIZfmvq6CzS3Bi3t6JQGTjNuDjXb6lqohJiP3TsAYjTpik7suRJJ6uerm-eMw84QUWSkEaD4jDU_blERy4ZCDIHTX5E6lifAWSoD8nJKcr0jxyNFXOTVBFgP4_oUmX_wWLj2t2M8MhX0YMc87TriC6f5-2OtSBKEQ7Hiecyxy-CA6wfUZEX5kg70Awjb9YmCqWJ1qO3D6Sb4kMekzkc"
                              })`,
                            }}
                          ></div>
                          <div>
                            <p className="text-white font-semibold">
                              {review.user.name || "Anonymous"}
                            </p>
                            <p className="text-[#9ea4b7] text-xs">
                              {timeAgo(review._creationTime)}
                            </p>
                          </div>
                        </div>
                        {/* Rating stars */}
                        <div className="flex text-[#F59E0B]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? "fill-current"
                                  : "text-[#F59E0B]"
                              }`}
                            />
                          ))}
                        </div>
                        {/* Review text */}
                        <p className="text-white/90 text-sm leading-relaxed">
                          {review.content}
                        </p>
                        <div className="flex gap-4 text-[#9ea4b7]">
                          <button
                            className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                            onClick={() =>
                              handleLikeReview(
                                review._id,
                                isLiked ? isLiked : false,
                              )
                            }
                          >
                            <ThumbsUp
                              className={`h-4 w-4 ${isLiked ? "fill-current text-blue-600" : ""}`}
                            />
                            {review.likesCount}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-white/70 text-sm">No reviews yet.</p>
                )}

                {!isDone && (
                  <button
                    className="text-[var(--primary-color)] font-semibold text-sm hover:underline"
                    onClick={loadMore}
                  >
                    Show more
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
