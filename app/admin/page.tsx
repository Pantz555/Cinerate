"use client";

import type React from "react";
import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Search,
  Filter,
  Star,
  Film,
  Users,
  TrendingUp,
  BarChart3,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { MovieCardSkeleton } from "@/components/skeleton/movie-card-skeleton";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import RecentActivityCard from "@/components/activity-card";
import Analytics from "@/components/analytics";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");

  const [isMovieEditOpen, setIsMovieEditOpen] = useState(false);

  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user } = useQueryWithStatus(api.auth.loggedInUser);
  const { data: movieStats } = useQueryWithStatus(api.admin.getDashboardStats);
  const router = useRouter();

  // Form state for adding/editing movies
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    genres: [],
    genre: "",
    year: "",
    director: "",
    cast: "",
    poster: "",
    trailer: "",
    duration: "",
    rating: "",
    featured: false,
    trending: false,
    status: "published", // published, draft, archived
  });

  const {
    results: movies,
    status: paginationStatus,
    loadMore,
    isLoading: isPending,
  } = usePaginatedQuery(api.movies.listMovies, {}, { initialNumItems: 4 });

  // Mutations
  const createMovie = useMutation(api.movies.createMovie);
  const updateMovie = useMutation(api.movies.updateMovie);
  const deleteMovie = useMutation(api.movies.deleteMovie);
  const updateMovieStatus = useMutation(api.movies.updateMovieStatus);
  const generateUploadUrl = useMutation(api.movies.generateUploadUrl);

  if (user && user?.role !== "admin") {
    router.push("/");
    return (
      <p>You don't have access to this page redirecting to home page...</p>
    );
  }

  const resetForm = () => {
    const defaultForm = {
      title: "",
      description: "",
      genres: [],
      genre: "",
      year: "",
      director: "",
      cast: "",
      poster: "",
      trailer: "",
      duration: "",
      rating: "",
      status: "published",
    };
    setMovieForm({ ...defaultForm } as any);
    setPosterFile(null);
    setPosterPreview("");
    setEditingMovie(null);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPosterPreview(result);
        setMovieForm({ ...movieForm, poster: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPoster = () => {
    setPosterFile(null);
    setPosterPreview("");
    setMovieForm({ ...movieForm, poster: "" });
  };

  const handleAddMovie = async () => {
    if (!posterFile && !movieForm.poster) {
      toast.error("Please upload a poster or provide a poster URL!");
      return;
    }
    setIsAddingMovie(true);

    if (
      !movieForm.title ||
      !movieForm.director ||
      !movieForm.genres.length ||
      !movieForm.year ||
      !movieForm.description ||
      !movieForm.cast
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      let storageId = null;

      // Upload file if provided
      if (posterFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": posterFile.type },
          body: posterFile,
        });
        const result = await res.json();
        storageId = result.storageId;
      }

      await createMovie({
        title: movieForm.title,
        description: movieForm.description,
        genre: movieForm.genre,
        genres: movieForm.genres,
        year: movieForm.year,
        director: movieForm.director,
        cast: movieForm.cast,
        trailer: movieForm.trailer,
        duration: movieForm.duration,
        status: movieForm.status as "published" | "draft" | "archived",
        rating: 0,
        featured: movieForm.featured,
        trending: movieForm.trending,
        posterUrl: storageId ? undefined : movieForm.poster,
        posterFileId: storageId,
      });

      toast.success("Movie added successfully!");
      setIsAddingMovie(false);
      resetForm();
      setIsAddMovieOpen(false);
    } catch (error) {
      setIsAddingMovie(false);

      console.error("Movie create error: ", error);
      toast.error("Failed to create movie!");
    }
  };

  const handleEditMovie = (movie: any) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description || "",
      genre: movie.genre,
      genres:
        movie.genres ||
        (movie.genre ? movie.genre.split(",").map((g: any) => g.trim()) : []),
      year: movie.year,
      director: movie.director,
      cast: movie.cast || "",
      poster: movie.posterUrl || "",
      trailer: movie.trailer || "",
      duration: movie.duration || "",
      rating: movie.rating?.toString() || "0",
      status: movie.status,
      featured: movie.featured,
      trending: movie.trending,
    });
    setPosterPreview(movie.posterUrl || "");
    setIsMovieEditOpen(false);
  };

  const handleUpdateMovie = async () => {
    if (!editingMovie) return;

    if (
      !movieForm.title ||
      !movieForm.director ||
      !movieForm.year ||
      !movieForm.genres.length ||
      !movieForm.description ||
      !movieForm.cast
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setIsUpdating(true);
    try {
      let storageId = null;

      // Upload new file if provided
      if (posterFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": posterFile.type },
          body: posterFile,
        });
        const result = await res.json();
        storageId = result.storageId;
      }

      const updateData: any = {
        id: editingMovie._id,
        title: movieForm.title,
        description: movieForm.description,
        genres: movieForm.genres,
        genre: movieForm.genre,
        year: movieForm.year,
        director: movieForm.director,
        cast: movieForm.cast,
        trailer: movieForm.trailer,
        duration: movieForm.duration,
        featured: movieForm.featured,
        trending: movieForm.trending,
        status: movieForm.status as "published" | "draft" | "archived",
        rating: parseFloat(movieForm.rating) || 0,
      };

      // Only update poster if a new one is provided
      if (storageId) {
        updateData.posterFileId = storageId;
        //  updateData.posterUrl = editingMovie.poster;
      } else if (movieForm.poster !== (editingMovie.poster || "")) {
        updateData.posterUrl = movieForm.poster;
      }

      await updateMovie(updateData);

      setIsUpdating(false);

      toast.success("Movie updated successfully!");
      resetForm();
      setIsMovieEditOpen(false);
    } catch (error) {
      setIsUpdating(false);

      console.error("Movie update error: ", error);
      toast.error("Failed to update movie!");
    }
  };

  const handleDeleteMovie = async (id: Id<"movies">, title: string) => {
    setIsDeleting(true);
    try {
      await deleteMovie({ id });
      setIsDeleting(false);

      toast.success(`"${title}" deleted successfully!`);
    } catch (error) {
      setIsDeleting(false);

      console.error("Movie delete error: ", error);
      toast.error("Failed to delete movie!");
    }
  };

  const handleStatusChange = async (id: Id<"movies">, newStatus: string) => {
    try {
      await updateMovieStatus({
        id,
        status: newStatus as "published" | "draft" | "archived",
      });
      toast.success("Movie status updated successfully!");
    } catch (error) {
      console.error("Status update error: ", error);
      toast.error("Failed to update movie status!");
    }
  };

  const filteredMovies = movies?.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || movie.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0f1419]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Movie Admin
              </h1>
              <p className="mt-2 text-lg text-gray-400">
                Manage your movie database
              </p>
            </div>
            <Dialog open={isAddMovieOpen} onOpenChange={setIsAddMovieOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Movie
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1d23] border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Add New Movie
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={movieForm.title}
                        onChange={(e) =>
                          setMovieForm({ ...movieForm, title: e.target.value })
                        }
                        className="bg-[#2a2d38] border-gray-600 text-white"
                        placeholder="Movie title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-gray-300">
                        Year *
                      </Label>
                      <Input
                        id="year"
                        value={movieForm.year}
                        onChange={(e) =>
                          setMovieForm({ ...movieForm, year: e.target.value })
                        }
                        className="bg-[#2a2d38] border-gray-600 text-white"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={movieForm.description}
                      onChange={(e) =>
                        setMovieForm({
                          ...movieForm,
                          description: e.target.value,
                        })
                      }
                      className="bg-[#2a2d38] border-gray-600 text-white"
                      placeholder="Movie description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="genres" className="text-gray-300">
                        Genres *
                      </Label>
                      <Input
                        id="genres"
                        value={movieForm.genres.join(", ")} // Display as comma-separated for user
                        onChange={(e: any) =>
                          setMovieForm({
                            ...movieForm,
                            genres: e.target.value
                              .split(",")
                              .map((g: any) => g.trim())
                              .filter((g: any) => g), // Convert to array
                          })
                        }
                        className="bg-[#2a2d38] border-gray-600 text-white"
                        placeholder="Action, Drama, Sci-Fi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="director" className="text-gray-300">
                        Director *
                      </Label>
                      <Input
                        id="director"
                        value={movieForm.director}
                        onChange={(e) =>
                          setMovieForm({
                            ...movieForm,
                            director: e.target.value,
                          })
                        }
                        className="bg-[#2a2d38] border-gray-600 text-white"
                        placeholder="Director name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cast" className="text-gray-300">
                      Cast
                    </Label>
                    <Input
                      id="cast"
                      value={movieForm.cast}
                      onChange={(e) =>
                        setMovieForm({ ...movieForm, cast: e.target.value })
                      }
                      className="bg-[#2a2d38] border-gray-600 text-white"
                      placeholder="Actor 1, Actor 2, Actor 3"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Movie Poster</Label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePosterUpload}
                            className="bg-[#2a2d38] border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>

                      {posterPreview && (
                        <div className="relative w-32 h-48 mx-auto">
                          <Image
                            src={posterPreview || "/placeholder.svg"}
                            alt="Poster preview"
                            width={128}
                            height={192}
                            className="w-full h-full object-cover rounded-lg border border-gray-600"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={clearPoster}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <div className="text-center">
                        <span className="text-gray-400 text-sm">or</span>
                      </div>

                      <div>
                        <Label htmlFor="poster-url" className="text-gray-300">
                          Poster URL
                        </Label>
                        <Input
                          id="poster-url"
                          value={movieForm.poster}
                          onChange={(e) => {
                            setMovieForm({
                              ...movieForm,
                              poster: e.target.value,
                            });
                            setPosterPreview(e.target.value);
                          }}
                          className="bg-[#2a2d38] border-gray-600 text-white"
                          placeholder="https://example.com/poster.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="text-gray-300">
                        Duration
                      </Label>
                      <Input
                        id="duration"
                        value={movieForm.duration}
                        onChange={(e) =>
                          setMovieForm({
                            ...movieForm,
                            duration: e.target.value,
                          })
                        }
                        className="bg-[#2a2d38] border-gray-600 text-white"
                        placeholder="2h 30m"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-gray-300">
                        Status
                      </Label>
                      <Select
                        value={movieForm.status}
                        onValueChange={(value) =>
                          setMovieForm({ ...movieForm, status: value })
                        }
                      >
                        <SelectTrigger className="bg-[#2a2d38] border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2d38] border-gray-600">
                          <SelectItem
                            value="published"
                            className="text-white hover:bg-gray-700"
                          >
                            Published
                          </SelectItem>
                          <SelectItem
                            value="draft"
                            className="text-white hover:bg-gray-700"
                          >
                            Draft
                          </SelectItem>
                          <SelectItem
                            value="archived"
                            className="text-white hover:bg-gray-700"
                          >
                            Archived
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Featured</Label>
                    <Switch
                      checked={movieForm.featured}
                      onCheckedChange={(v) =>
                        setMovieForm({
                          ...movieForm,
                          featured: v,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Trending</Label>
                    <Switch
                      checked={movieForm.trending}
                      onCheckedChange={(v) =>
                        setMovieForm({
                          ...movieForm,
                          trending: v,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddMovieOpen(false);
                    }}
                    disabled={isAddingMovie}
                    className="border-gray-600 text-black hover:bg-gray-700 hover:text-black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMovie}
                    disabled={isAddingMovie}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isAddingMovie ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add Movie
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#1a1d23] border-gray-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="movies"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white"
              >
                Movies
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Movies
                    </CardTitle>
                    <Film className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {movieStats?.overview.totalMovies}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Published
                    </CardTitle>
                    <Eye className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {movieStats?.overview.publishedMovies}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-800/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Drafts
                    </CardTitle>
                    <EyeOff className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {movieStats?.overview.draftMovies}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Views
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {movieStats?.overview.totalViews}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 border-pink-800/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Reviews
                    </CardTitle>
                    <Users className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {movieStats?.overview.totalReviews}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <RecentActivityCard />
            </TabsContent>

            <TabsContent value="movies" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1a1d23] border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px] bg-[#1a1d23] border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1d23] border-gray-600">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value="published"
                        className="text-white hover:bg-gray-700"
                      >
                        Published
                      </SelectItem>
                      <SelectItem
                        value="draft"
                        className="text-white hover:bg-gray-700"
                      >
                        Draft
                      </SelectItem>
                      <SelectItem
                        value="archived"
                        className="text-white hover:bg-gray-700"
                      >
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Movies Grid */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <MovieCardSkeleton key={i} />
                    ))
                  : filteredMovies?.map((movie) => (
                      <Card
                        key={movie?._id}
                        className="bg-[#1a1d23] border-gray-700 overflow-hidden group hover:border-blue-500/50 transition-colors"
                      >
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <Image
                            src={movie.posterUrl || "/placeholder.svg"}
                            width={128}
                            height={192}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant={
                                movie.status === "published"
                                  ? "default"
                                  : movie.status === "draft"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                movie.status === "published"
                                  ? "bg-green-600 text-white"
                                  : movie.status === "draft"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                              }
                            >
                              {movie.status}
                            </Badge>
                          </div>

                          {movie?.featured && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-green-500 text-white">
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-white font-semibold text-lg mb-1 truncate">
                            {movie.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {movie.director} • {movie.year}
                          </p>
                          <p className="text-gray-500 text-xs mb-3">
                            {movie.genre}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-white text-sm">
                                {movie.avgRating || "N/A"}
                              </span>
                            </div>
                            <div className="text-gray-400 text-xs">
                              {movie.views} views • {movie.reviews} reviews
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dialog
                              open={isMovieEditOpen}
                              onOpenChange={setIsMovieEditOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                                  onClick={() => handleEditMovie(movie)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#1a1d23] border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Edit Movie: {editingMovie?.title}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label
                                        htmlFor="edit-title"
                                        className="text-gray-300"
                                      >
                                        Title *
                                      </Label>
                                      <Input
                                        id="edit-title"
                                        value={movieForm.title}
                                        onChange={(e) =>
                                          setMovieForm({
                                            ...movieForm,
                                            title: e.target.value,
                                          })
                                        }
                                        className="bg-[#2a2d38] border-gray-600 text-white"
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="edit-year"
                                        className="text-gray-300"
                                      >
                                        Year *
                                      </Label>
                                      <Input
                                        id="edit-year"
                                        value={movieForm.year}
                                        onChange={(e) =>
                                          setMovieForm({
                                            ...movieForm,
                                            year: e.target.value,
                                          })
                                        }
                                        className="bg-[#2a2d38] border-gray-600 text-white"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label
                                      htmlFor="edit-description"
                                      className="text-gray-300"
                                    >
                                      Description
                                    </Label>
                                    <Textarea
                                      id="edit-description"
                                      value={movieForm.description}
                                      onChange={(e) =>
                                        setMovieForm({
                                          ...movieForm,
                                          description: e.target.value,
                                        })
                                      }
                                      className="bg-[#2a2d38] border-gray-600 text-white"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label
                                        htmlFor="edit-genres"
                                        className="text-gray-300"
                                      >
                                        Genres *
                                      </Label>
                                      <Input
                                        id="edit-genres"
                                        value={movieForm.genres.join(", ")} // Display as comma-separated
                                        onChange={(e: any) =>
                                          setMovieForm({
                                            ...movieForm,
                                            genres: e.target.value
                                              .split(",")
                                              .map((g: any) => g.trim())
                                              .filter((g: any) => g),
                                          })
                                        }
                                        className="bg-[#2a2d38] border-gray-600 text-white"
                                        placeholder="Action, Drama, Sci-Fi"
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="edit-director"
                                        className="text-gray-300"
                                      >
                                        Director *
                                      </Label>
                                      <Input
                                        id="edit-director"
                                        value={movieForm.director}
                                        onChange={(e) =>
                                          setMovieForm({
                                            ...movieForm,
                                            director: e.target.value,
                                          })
                                        }
                                        className="bg-[#2a2d38] border-gray-600 text-white"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label
                                      htmlFor="edit-cast"
                                      className="text-gray-300"
                                    >
                                      Cast
                                    </Label>
                                    <Input
                                      id="edit-cast"
                                      value={movieForm.cast}
                                      onChange={(e) =>
                                        setMovieForm({
                                          ...movieForm,
                                          cast: e.target.value,
                                        })
                                      }
                                      className="bg-[#2a2d38] border-gray-600 text-white"
                                      placeholder="Actor 1, Actor 2, Actor 3"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-gray-300">
                                      Movie Poster
                                    </Label>
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                          <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePosterUpload}
                                            className="bg-[#2a2d38] border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload
                                        </Button>
                                      </div>

                                      {posterPreview && (
                                        <div className="relative w-32 h-48 mx-auto">
                                          <Image
                                            src={
                                              posterPreview ||
                                              "/placeholder.svg"
                                            }
                                            width={128}
                                            height={192}
                                            alt="Poster preview"
                                            className="w-full h-full object-cover rounded-lg border border-gray-600"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                            onClick={clearPoster}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}

                                      <div className="text-center">
                                        <span className="text-gray-400 text-sm">
                                          or
                                        </span>
                                      </div>

                                      <div>
                                        <Label
                                          htmlFor="edit-poster-url"
                                          className="text-gray-300"
                                        >
                                          Poster URL
                                        </Label>
                                        <Input
                                          id="edit-poster-url"
                                          value={movieForm.poster}
                                          onChange={(e) => {
                                            setMovieForm({
                                              ...movieForm,
                                              poster: e.target.value,
                                            });
                                            setPosterPreview(e.target.value);
                                          }}
                                          className="bg-[#2a2d38] border-gray-600 text-white"
                                          placeholder="https://example.com/poster.jpg"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label
                                        htmlFor="edit-duration"
                                        className="text-gray-300"
                                      >
                                        Duration
                                      </Label>
                                      <Input
                                        id="edit-duration"
                                        value={movieForm.duration}
                                        onChange={(e) =>
                                          setMovieForm({
                                            ...movieForm,
                                            duration: e.target.value,
                                          })
                                        }
                                        className="bg-[#2a2d38] border-gray-600 text-white"
                                        placeholder="2h 30m"
                                      />
                                    </div>

                                    <div>
                                      <Label
                                        htmlFor="edit-status"
                                        className="text-gray-300"
                                      >
                                        Status
                                      </Label>
                                      <Select
                                        value={movieForm.status}
                                        onValueChange={(value) =>
                                          setMovieForm({
                                            ...movieForm,
                                            status: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="bg-[#2a2d38] border-gray-600 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#2a2d38] border-gray-600">
                                          <SelectItem
                                            value="published"
                                            className="text-white hover:bg-gray-700"
                                          >
                                            Published
                                          </SelectItem>
                                          <SelectItem
                                            value="draft"
                                            className="text-white hover:bg-gray-700"
                                          >
                                            Draft
                                          </SelectItem>
                                          <SelectItem
                                            value="archived"
                                            className="text-white hover:bg-gray-700"
                                          >
                                            Archived
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-gray-300">
                                      Featured
                                    </Label>
                                    <Switch
                                      checked={movieForm.featured}
                                      onCheckedChange={(v) =>
                                        setMovieForm({
                                          ...movieForm,
                                          featured: v,
                                        })
                                      }
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-gray-300">
                                      Trending
                                    </Label>
                                    <Switch
                                      checked={movieForm.trending}
                                      onCheckedChange={(v) =>
                                        setMovieForm({
                                          ...movieForm,
                                          trending: v,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    disabled={isUpdating}
                                    variant="outline"
                                    onClick={() => {
                                      setIsMovieEditOpen(false);
                                      resetForm();
                                    }}
                                    className="border-gray-600 text-black hover:bg-gray-700"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    disabled={isUpdating}
                                    onClick={handleUpdateMovie}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {isUpdating ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Movie
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Select
                              value={movie.status}
                              onValueChange={(value) =>
                                handleStatusChange(movie._id, value)
                              }
                            >
                              <SelectTrigger className="w-[100px] h-8 bg-[#2a2d38] border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#2a2d38] border-gray-600">
                                <SelectItem
                                  value="published"
                                  className="text-white hover:bg-gray-700 text-xs"
                                >
                                  Publish
                                </SelectItem>
                                <SelectItem
                                  value="draft"
                                  className="text-white hover:bg-gray-700 text-xs"
                                >
                                  Draft
                                </SelectItem>
                                <SelectItem
                                  value="archived"
                                  className="text-white hover:bg-gray-700 text-xs"
                                >
                                  Archive
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#1a1d23] border-gray-700 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Delete Movie
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    Are you sure you want to delete &quot;
                                    {movie.title}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    disabled={isDeleting}
                                    className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteMovie(movie._id, movie.title)
                                    }
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
              </div>

              {!isPending && filteredMovies?.length === 0 && (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    No movies found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}

              {/* Load More Button */}
              {paginationStatus === "CanLoadMore" && (
                <div className="flex justify-center mt-10">
                  <Button
                    onClick={() => loadMore(4)}
                 
                  >
                    Load More Movies
                  </Button>
                </div>
              )}

              {paginationStatus === "LoadingMore" && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading more movies...</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-[#1a1d23] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Analytics />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
