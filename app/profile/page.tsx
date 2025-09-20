"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Home,
  Search,
  List,
  MessageSquare,
  User,
  Plus,
  Edit,
  Star,
  Trophy,
  X,
  BarChart3,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

const ratingData = [
  { rating: "1★", count: 8, percentage: 30 },
  { rating: "2★", count: 5, percentage: 20 },
  { rating: "3★", count: 35, percentage: 70 },
  { rating: "4★", count: 52, percentage: 85 },
  { rating: "5★", count: 25, percentage: 50 },
];

export default function ProfilePage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [editRatings, setEditRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });
  const [hoverRatings, setHoverRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });

  const {
    data: user,
    isPending,
    error,
  } = useQueryWithStatus(api.auth.loggedInUser);

  const { signOut } = useAuthActions();

  const recentlyRated = [
    {
      id: 1,
      title: "The Enigma",
      genre: "Action, Adventure",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVaCrnolDxEZkViVSa1FL_wRIGSHxvTUkAwRT7n7HIpKKE3sNp-Dd1ijX5cf-DolH_F7EmEBCL6S8aoFbUDn3hq7U2mFMLiXv9X-30AZ-T_8m8qa_OfdaIpPf8MuHhoB0uB5FcdnlTpyjjq5rqsra6WQEWAll5_X6Htl1VUScaAAAldyXNaN3DhJRLaJslyt21scxMTXfWoQXV8xRX4rqmfQSzZHorJTM_bttBSt3fz_W3fd3DtI_K2Ql9xTtRjHhwFqbecJIa1-o",
    },
    {
      id: 2,
      title: "Starlight Symphony",
      genre: "Drama, Romance",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7IBlqgq6JyqTmVYsUtvLil5ECQotXDTwjfYLpWkET-oAkUoEBy_Mm75YJerlKC1depFfYELfIEUpnsc6EEk5P9aypyo1Fn3luo_L4IUAvGvDMs32tg2Eetiy9PCW1KTCz4Q5pRlIyWXAonCgH4fI74NSw3Dbgg1RLx6v6c636R7JJpRNyiofqCOGQ9Q0mPpBGzkbmc46WuoCT-YhqVqdyQ3dhjDLelgqg9Q1CF_DMP29FTyq30JJKa7j66RvqVTeLKEKcjxJcL4U",
    },
    {
      id: 3,
      title: "Crimson Tide",
      genre: "Thriller, Mystery",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDhOmBNaOP6AsPGd0zKF9PYriYAP4SNnPqVVMmp1klFd4fIhZ3HgFpJYqASDp1uQ-GICBkhz_jfkcL2djKfvDxUxyv_pVmOHVVleQjgYw10Kjs5qpRsVEmLeSsb7ZZil93-BkFdy4QOYV0UtQjUwdh_3daHTjDRQfe6ryGbYB0qJXjHhMSE3Yo9Tu-CIazZ5fTfXsz7P--jfx8Q748DLA62t9IOyd-OcGh2qfVk3812TMyvP23MMIR4YZ04g-zHvsvrcp8ZkjOnRnEQ",
    },
    {
      id: 4,
      title: "Echoes of Tomorrow",
      genre: "Sci-Fi, Fantasy",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDfGJ_wo466aWRnqmtEjMHbwZkmPyewYgxNX2ptP1OgO6OTPrbp7QFEBn-VWSq8yHbcuFzweJIArrr3AJhvDxUxyv_pVmOHVVleQjgYw10Kjs5qpRsVEmLeSsb7ZZil93-BkFdy4QOYV0UtQjUwdh_3daHTjDRQfe6ryGbYB0qJXjHhMSE3Yo9Tu-CIazZ5fTfXsz7P--jfx8Q748DLA62t9IOyd-OcGh2qfVk3812TMyvP23MMIR4YZ04g-zHvsvrcp8ZkjOnRnEQ",
    },
    {
      id: 5,
      title: "Whispers of the Past",
      genre: "Historical, Epic",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCpWnivv6eboQyrAsNRFALUf77WNixj87deHy9ULtOPMzXbE9d8DwCTlrY6gPjPsDM_qMnS779B9b9kEdPbYUQAKEHnKMNriCAGrJIyMD9XmywY1Lpz67YGBPuMTZmVz7Krw9XO8K6AiEWAd8K4lD9ecRYaYLDJqWDHBXhr6g7TqsbmoMeEeyVU5-fR6VtJjUE9xmSJcJpL9vyRwo-sJcTy0aR7mDzhvZUulXT5L5rRiXxaqQQKRF52ih4vQPHnYyhRG7dc3FIuOWc",
    },
  ];

  const recommendations = [
    {
      id: 6,
      title: "The Silent Observer",
      genre: "Action, Adventure",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAByi1I_pA2uky8crA53lIq4YjKcJY9tbPuuQBAMZlg-dFD6K8IVh-3gycJfHENqqQxct_jOafE-13DxGdZ1zgLtlnPgqBmpr_C_s1vem2GCp7wEUHyke-yX6HkMt7rHEHr1VaETLVeeFn4snaHaf6zCmV51r00qA0jmlrLylTeOeeEDKj7x2ROOI1W2XWmYlDEpnCACJ4HsRUCqaM9a78tDNHi6J-wFc-3H_0tO3D0gyMMAwTXy8JHlRx885jeECKb0jkktdrWQKQ",
    },
    {
      id: 7,
      title: "Celestial Dance",
      genre: "Drama, Romance",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA4Ng3TCkondxTrhDDAJ1EvFELrf1B0-VSEVZotgJhwNl14FBJny0DscgrwmgaMJKU26kvWgvHOA43uamOePb_ofbK7dv3oW6ezdpQOjQpUWtQSC6FeaJoLDtX1qdHRMU17IcFkGhgHgCVDLNYgfDXuI2hN4y989nshJ5lHky5ewhV1MQI3u19PXJgT0-FEAdSdXDFJ_gQQBXhejsTqiJB0VCdau2btwtoV8ip6eEald5SxtK98wZAmXDQvod8--IZjEPRF3nrMhWg",
    },
    {
      id: 8,
      title: "Scarlet Horizon",
      genre: "Thriller, Mystery",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCv8YqAnCd9NDvQrLzp6FiBCsYjkR7aZ5wK8zC8ceM-OqaWlTEdEtNtFEnbijekfdn6_-FT0_A-qpVa_j7iECoEyyyLk4JYLYsyjRHSZAjk6bi0k6EKbbiLgjajovog74WsGSfKyNCcbRtPxrMw-SmFYrBX6LFIjHTzS9v7NOqdkdMjYk3VVlCQnKShC6XwKpgpLlDs3vZARRwzr501A8IgIMubPcLxB1_JNyvntfLic9suex7mpykX9A4LrO0NWZhMRk4NuvYCjcw",
    },
    {
      id: 9,
      title: "Reflections of the Future",
      genre: "Sci-Fi, Fantasy",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBoqDd89fpVjmbDgo8_2qhWdsvqFSlTzgCVJksV020C2uF2MlXfIQNhTXkK7vUpkhIx0_pS_iyEUyp3nv2INrIUKhUApmo2KqR3Dt6e_tFfcpLVSYTDMIL-8hJqdHE8G3ykDIFxp-zHpkgT_4zgJTeIpbdJT_ZEEhpcUtm2bdBzKDMv-l2JK00Li202RsWDER5U7FBAMCTbAjGIj-ueIyE7sQORJcq6YoiHHTKMd7-XlV0g6rXv4ijBCkx73ssmmABGA3uZWfBQTH8",
    },
    {
      id: 10,
      title: "Secrets of Yesterday",
      genre: "Historical, Epic",
      poster:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC3y2XrSuVgAAZ6TPDYfcI-cDQQLD4uidAj-M8T6FPqVrMXysXx9WUU8Lh5eh0BXRKiWr4D5XsqamTjAzy6iNqDCUUBixaVkBB-iBFUINaXj3GdIAy1rC1YI9imW7tI3OPyCsmOo7z4h-ESAvlPAeRZDEZ98zbLz7YI1zDTgT4a-fajYuJMtSt7Vf_GsCa0uwtVdPejG36YkNaWaUyCtxp_WgcS7UUS2BJLcRXZNmUNsW4WjF4zs7j68V8WpWBbVUTlYKs-AyeqJKc-i3l0mc",
    },
  ];

  const achievements = [
    {
      title: "First Rating",
      description: "Rated your first movie",
      icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJYFv0vCgJM-30l0SRKz23167xa6lXs7HNauTqWVg0JYd8sWzG2C3K7s4tQYYVAyXSzdbHrrsY0o2YQsNsdSs_Bb5rT8NnFZNCB_owl8jT6vt7TpsnDWAFdiVYoMZTIAdYSndkymQgZ7pQANm116ocZhRvwcQlXl3NlsyKHfGwpEmSOz2LuIKv4JPZRdI5XGxNIIbKIzpfP3j4c9xs-9GP8CAr6d_YSMj6IAWHP6raLTEYVwTS5dkb5mux9-0WtUl92eQ0dky3PIM",
    },
    {
      title: "50 Ratings",
      description: "Rated 50 movies",
      icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcEDefuKY2ZWUCYWyBSXIEJh0zK5Dg0VAEBOKS7IzgwVlhP5emvTn45urkTrmu_NfjPlj8S9HJo-KaiNmIOXXbAB6N0aP9u1UJRMhPG1kf6tZXczkIRIs2I6SFPlpD1T7BmyWtzGw7gle2ylaAXjifjuuQ5Oz8BgNcoXFMRFGjhD2lagh7trQxdtVExOM0zI1tyVlRSfIWGiSnTd1051KLkplQsb9vl9_vYSs4x2FJdwQxFXAJuiJsfj00OWC4ghmOarRc-i3l0mc",
    },
    {
      title: "100 Ratings",
      description: "Rated 100 movies",
      icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQjr17ENQ4H9qVEmjDFQKJN2tSYBuE6yeHveQ233-3TVil3Da8-GY3Aplqp_Al2bRapi-OrNoc1pAf0UgFVOtGFl4w1KuwbzzylXFQrLi6BrYLsAgSCWCZwEILAonwqvTZW0bKgYA6SlDEkr6Oy9uEr91WNNFFIP19pmhYVRwGhT1gY97Ez2cvtAmEto-26nOzAJQz8yqG-MgM02DsMj0ApGjSxOhEhC6rMpCIY49b8n8NYdeR1YJ2pmUyXMMesqLiBWs14KdDPB0",
    },
    {
      title: "Active Week",
      description: "Rated movies for 7 days straight",
      icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc1v68R7SVgfPyqsEk5KpD7HbzZY9yqx4MVhVC4T_sXWkevawrVlcdw3lHubkG6M-9POZo2aPYnWBBFw8POWk7q-yOLqnlL-KmbrTpt3h4o7fZ0gPYSOSNWMMjy-PLqtEom7JhY_YTfkAEurrrA4GgESpNdYSJ-06b3j8mW6Sx771PYfc5z5vcVwHVDJazj22mtRDLtdPB_DU-xY7ASRIwVWMd1z7G7p3SWY4n-2YnwjBPO-q4uJec2GoE9Nr-_UTJsmkI_QV7SO0",
    },
  ];

  const openEditModal = (movie: any, currentRatings?: any) => {
    setSelectedMovie(movie);
    setEditRatings(
      currentRatings || {
        acting: 4,
        plot: 4,
        cinematography: 5,
        direction: 4,
        entertainment: 4,
      },
    );
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMovie(null);
    setEditRatings({
      acting: 0,
      plot: 0,
      cinematography: 0,
      direction: 0,
      entertainment: 0,
    });
    setHoverRatings({
      acting: 0,
      plot: 0,
      cinematography: 0,
      direction: 0,
      entertainment: 0,
    });
  };

  const handleRatingChange = (category: string, value: number) => {
    setEditRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleRatingHover = (category: string, value: number) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleRatingLeave = (category: string) => {
    setHoverRatings((prev) => ({
      ...prev,
      [category]: 0,
    }));
  };

  const saveRating = () => {
    console.log(
      `Saving ratings for movie ${selectedMovie?.title}:`,
      editRatings,
    );
    closeEditModal();
  };

  const ratingCategories = [
    { key: "acting", label: "Acting Performance" },
    { key: "plot", label: "Plot & Story" },
    { key: "cinematography", label: "Cinematography" },
    { key: "direction", label: "Direction" },
    { key: "entertainment", label: "Entertainment Value" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 p-6 flex flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12"
              style={{
                backgroundImage: `url(${user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6UwcqaUrDvlTwlgA1mUex0HCVXzwY-g6kvn6l9KE9oPsWP_PLWpXDE5nBIZfmvq6CzS3Bi3t6JQGTjNuDjXb6lqohJiP3TsAYjTpik7suRJJ6uerm-eMw84QUWSkEaD4jDU_blERy4ZCDIHTX5E6lifAWSoD8nJKcr0jxyNFXOTVBFgP4_oUmX_wWLj2t2M8MhX0YMc87TriC6f5-2OtSBKEQ7Hiecyxy-CA6wfUZEX5kg70Awjb9YmCqWJ1qO3D6Sb4kMekzkc"})`,
              }}
            />
            <div>
              <h1 className="text-white text-lg font-semibold">
                {user?.name || "Anonymous"}
              </h1>
              <p className="text-sm font-normal text-slate-400">
                @{user?.name || "Anonymous"}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { name: "Home", icon: Home, href: "/" },
              { name: "Explore", icon: Search, href: "/discover" },
              { name: "Lists", icon: List, href: "/lists" },
              { name: "Reviews", icon: MessageSquare, href: "/community" },
              { name: "Profile", icon: User, href: "/profile" },
              {
                name: "Personalization",
                icon: Settings,
                href: "/personalization",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-200 ${
                  item.name === "Profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setActiveNav(item.name)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              onClick={signOut}
              className="flex items-center gap-3 text-black"
              variant="outline"
            >
              <LogOut />
              Logout
            </Button>
          </nav>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 p-6 flex flex-col justify-between z-[70] transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12"
                style={{
                  backgroundImage: `url(${user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6UwcqaUrDvlTwlgA1mUex0HCVXzwY-g6kvn6l9KE9oPsWP_PLWpXDE5nBIZfmvq6CzS3Bi3t6JQGTjNuDjXb6lqohJiP3TsAYjTpik7suRJJ6uerm-eMw84QUWSkEaD4jDU_blERy4ZCDIHTX5E6lifAWSoD8nJKcr0jxyNFXOTVBFgP4_oUmX_wWLj2t2M8MhX0YMc87TriC6f5-2OtSBKEQ7Hiecyxy-CA6wfUZEX5kg70Awjb9YmCqWJ1qO3D6Sb4kMekzkc"})`,
                }}
              />
              <div>
                <h1 className="text-white text-lg font-semibold">
                  {" "}
                  {user?.name || "Anonymous"}
                </h1>
                <p className="text-sm font-normal text-slate-400">
                  @ {user?.name || "Anonymous"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { name: "Home", icon: Home, href: "/" },
              { name: "Explore", icon: Search, href: "/discover" },
              { name: "Lists", icon: List, href: "/lists" },
              { name: "Reviews", icon: MessageSquare, href: "/community" },
              { name: "Profile", icon: User, href: "/profile" },

              {
                name: "Personalization",
                icon: Settings,
                href: "/personalization",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-200 ${
                  item.name === "Profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => {
                  setActiveNav(item.name);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              onClick={signOut}
              className="flex items-center gap-3 text-black"
              variant="outline"
            >
              <LogOut />
              Logout
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="text-white hover:bg-slate-700 p-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-white text-xl font-bold">Profile</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <header className="mb-10">
          <h1 className="text-white text-2xl lg:text-4xl font-bold tracking-tighter">
            Welcome back, {user?.name || "Anonymous"}!
          </h1>
          <p className="text-base mt-1 text-slate-400">
            Here's a look at your rating journey.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Quick Access
          </h2>
          <div className="grid grid-cols-1">
            <Link href="/personalization">
              <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300 cursor-pointer group">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-green-400 group-hover:text-green-300" />
                    <p className="text-white font-semibold">Personalization</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Customize your experience and manage recommendation
                    preferences
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recently Rated Section */}
        <section className="mb-12">
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Recently Rated
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {recentlyRated.map((movie, index) => (
              <div
                key={movie.id}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                <div className="relative">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundImage: `url("${movie.poster}")` }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30"
                      onClick={() => openEditModal(movie, 4 + (index % 2))}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold truncate text-sm lg:text-base">
                    {movie.title}
                  </p>
                  <p className="text-xs lg:text-sm text-slate-400">
                    {movie.genre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Your Stats */}
            <section className="mb-8">
              <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                Your Stats
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Total Ratings
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter">
                      125
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Average Rating
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter flex items-center gap-2">
                      4.2{" "}
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Rating Streak
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter">
                      15{" "}
                      <span className="text-lg font-medium text-slate-400">
                        Days
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Rating Patterns Chart */}
            <section>
              <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                Rating Patterns
              </h2>
              <Card className="bg-slate-800 border-transparent">
                <CardHeader>
                  <CardTitle className="text-white font-semibold">
                    Ratings Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Number of Ratings",
                        color: "#3b82f6",
                      },
                    }}
                    className="h-48 w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingData}>
                        <XAxis
                          dataKey="rating"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#D1D5DB", fontSize: 12 }}
                        />
                        <YAxis hide />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          className=""
                          activeBar={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Achievements Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="bg-slate-800 border-transparent">
              <CardHeader>
                <CardTitle className="text-white text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 lg:w-16 lg:h-16 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                      style={{ backgroundImage: `url("${achievement.icon}")` }}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm lg:text-base">
                        {achievement.title}
                      </p>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Personalized Recommendations */}
        <section>
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Personalized Recommendations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {recommendations.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <div className="flex flex-col gap-3 group cursor-pointer">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundImage: `url("${movie.poster}")` }}
                  />
                  <div>
                    <p className="text-white font-semibold truncate text-sm lg:text-base">
                      {movie.title}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-400">
                      {movie.genre}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Rating Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">Edit Rating</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {selectedMovie && (
              <div className="flex gap-4 mb-6">
                <div
                  className="w-20 h-28 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                  style={{ backgroundImage: `url("${selectedMovie.poster}")` }}
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">
                    {selectedMovie.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-3">
                    {selectedMovie.genre}
                  </p>
                  <p className="text-sm text-slate-400">
                    Current Average:{" "}
                    <span className="text-white font-medium">
                      {(
                        Object.values(editRatings).reduce(
                          (a: number, b: number) => a + b,
                          0,
                        ) / 5
                      ).toFixed(1)}
                      ★
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-white font-medium mb-4">Rate Each Category</p>
              <div className="space-y-6">
                {ratingCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium text-sm">
                        {category.label}
                      </label>
                      <span className="text-sm text-slate-300">
                        {editRatings[category.key as keyof typeof editRatings] >
                        0
                          ? `${editRatings[category.key as keyof typeof editRatings]} star${editRatings[category.key as keyof typeof editRatings] > 1 ? "s" : ""}`
                          : "Not rated"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="p-1 transition-transform hover:scale-110"
                          onMouseEnter={() =>
                            handleRatingHover(category.key, star)
                          }
                          onMouseLeave={() => handleRatingLeave(category.key)}
                          onClick={() => handleRatingChange(category.key, star)}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <=
                              (hoverRatings[
                                category.key as keyof typeof hoverRatings
                              ] ||
                                editRatings[
                                  category.key as keyof typeof editRatings
                                ])
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-900 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">
                    {(
                      Object.values(editRatings).reduce(
                        (a: number, b: number) => a + b,
                        0,
                      ) / 5
                    ).toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400">/ 5.0</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeEditModal}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={saveRating}
                disabled={Object.values(editRatings).every(
                  (rating) => rating === 0,
                )}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Ratings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
