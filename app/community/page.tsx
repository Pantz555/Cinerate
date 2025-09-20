"use client";

import { Header } from "@/components/header";
import { ThumbsUp, MessageCircle, Share, Star, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CommunityPage() {
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<{
    [key: number]: Array<{ name: string; text: string; time: string }>;
  }>({
    0: [
      {
        name: "Marcus Johnson",
        text: "I totally agree! The action sequences were phenomenal.",
        time: "1d ago",
      },
      {
        name: "Emma Wilson",
        text: "The cinematography was also top-notch!",
        time: "1d ago",
      },
    ],
    1: [
      {
        name: "Alex Chen",
        text: "Couldn't agree more. The character development was incredible.",
        time: "2d ago",
      },
    ],
  });

  const handleReplySubmit = (reviewIndex: number) => {
    if (replyText.trim()) {
      const newReply = {
        name: "You",
        text: replyText,
        time: "now",
      };
      setReplies((prev) => ({
        ...prev,
        [reviewIndex]: [...(prev[reviewIndex] || []), newReply],
      }));
      setReplyText("");
      setShowReplyForm(null);
    }
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
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                🔥 Hot Movies
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {[
                  {
                    title: "The Last Stand",
                    genre: "Action",
                    image: "/placeholder.svg?height=300&width=200",
                  },
                  {
                    title: "Echoes of Yesterday",
                    genre: "Drama",
                    image: "/placeholder.svg?height=300&width=200",
                  },
                  {
                    title: "Laugh Riot",
                    genre: "Comedy",
                    image: "/placeholder.svg?height=300&width=200",
                  },
                  {
                    title: "Silent Witness",
                    genre: "Thriller",
                    image: "/placeholder.svg?height=300&width=200",
                  },
                  {
                    title: "Eternal Embrace",
                    genre: "Romance",
                    image: "/placeholder.svg?height=300&width=200",
                  },
                ].map((movie, index) => (
                  <div
                    key={index}
                    className="group flex cursor-pointer flex-col gap-3"
                  >
                    <div className="relative w-full overflow-hidden rounded-md bg-[#292d38] shadow-lg transition-transform group-hover:scale-105">
                      <div
                        className="aspect-[2/3] w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url("${movie.image}")` }}
                      ></div>
                    </div>
                    <div>
                      <p className="truncate text-sm font-semibold text-white">
                        {movie.title}
                      </p>
                      <p className="text-xs text-[#9ea4b7]">{movie.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Main Content Grid */}
            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Community Reviews */}
              <section className="md:col-span-2">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  Community Reviews
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      name: "Sophia Clark",
                      time: "2d ago",
                      review:
                        "The Last Stand was an incredible action movie! The plot twists kept me on the edge of my seat.",
                      likes: 12,
                      comments: 3,
                      avatar:
                        "/placeholder.svg?height=40&width=40&user=SophiaClark",
                    },
                    {
                      name: "Ethan Bennett",
                      time: "3d ago",
                      review:
                        "Echoes of Yesterday is a masterpiece of storytelling. The emotional depth is truly moving.",
                      likes: 25,
                      comments: 8,
                      avatar:
                        "/placeholder.svg?height=40&width=40&user=EthanBennett",
                    },
                    {
                      name: "Olivia Hayes",
                      time: "4d ago",
                      review:
                        "Laugh Riot had me in stitches! The comedic timing was perfect.",
                      likes: 18,
                      comments: 5,
                      avatar:
                        "/placeholder.svg?height=40&width=40&user=OliviaHayes",
                    },
                  ].map((review, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-[#292d38] p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="size-10 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
                          style={{ backgroundImage: `url("${review.avatar}")` }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="text-sm font-semibold text-white">
                              {review.name}
                            </p>
                            <p className="text-xs text-[#9ea4b7]">
                              {review.time}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-300">
                            {review.review}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-[#9ea4b7]">
                            <button className="flex items-center gap-1 transition-colors hover:text-white">
                              <ThumbsUp className="h-4 w-4" />
                              {review.likes}
                            </button>
                            <button
                              className="flex items-center gap-1 transition-colors hover:text-white"
                              onClick={() =>
                                setShowReplyForm(
                                  showReplyForm === index ? null : index,
                                )
                              }
                            >
                              <MessageCircle className="h-4 w-4" />
                              {review.comments + (replies[index]?.length || 0)}
                            </button>
                            <button className="flex items-center gap-1 transition-colors hover:text-white">
                              <Share className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {replies[index] && replies[index].length > 0 && (
                        <div className="mt-4 ml-14 space-y-3">
                          {replies[index].map((reply, replyIndex) => (
                            <div
                              key={replyIndex}
                              className="flex items-start gap-3"
                            >
                              <div className="size-8 shrink-0 rounded-full bg-[#292d38]"></div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xs font-semibold text-white">
                                    {reply.name}
                                  </p>
                                  <p className="text-xs text-[#9ea4b7]">
                                    {reply.time}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-gray-300">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showReplyForm === index && (
                        <div className="mt-4 ml-14">
                          <div className="flex gap-3">
                            <div className="size-8 shrink-0 rounded-full bg-[#292d38]"></div>
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full resize-none rounded-md border border-[#292d38] bg-[#1a1d23] p-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                rows={2}
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  onClick={() => setShowReplyForm(null)}
                                  className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReplySubmit(index)}
                                  className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                >
                                  <Send className="h-3 w-3" />
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity Sidebar */}
              <aside className="md:col-span-1">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
                  Recent Activity
                </h2>
                <div className="flex flex-col gap-4">
                  {[
                    {
                      title: "The Last Stand",
                      rating: 4.5,
                      image: "/placeholder.svg?height=72&width=48",
                    },
                    {
                      title: "Echoes of Yesterday",
                      rating: 3.8,
                      image: "/placeholder.svg?height=72&width=48",
                    },
                    {
                      title: "Laugh Riot",
                      rating: 4.2,
                      image: "/placeholder.svg?height=72&width=48",
                    },
                    {
                      title: "Silent Witness",
                      rating: 4.0,
                      image: "/placeholder.svg?height=72&width=48",
                    },
                    {
                      title: "Eternal Embrace",
                      rating: 4.7,
                      image: "/placeholder.svg?height=72&width=48",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 shrink-0 overflow-hidden rounded-md bg-[#292d38]">
                        <div
                          className="aspect-[2/3] w-full bg-cover bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url("${activity.image}")`,
                          }}
                        ></div>
                      </div>
                      <div>
                        <p className="truncate text-sm font-semibold text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-[#9ea4b7]">
                          <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" />{" "}
                          Rated {activity.rating}
                        </p>
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
