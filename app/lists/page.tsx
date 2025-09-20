import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Star, Plus, Eye, Heart, Clock, Film } from "lucide-react"

export default function ListsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0f1419]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">My Lists</h1>
              <p className="mt-2 text-lg text-gray-400">Organize your favorite movies into custom collections</p>
            </div>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New List
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Favorites",
                count: 24,
                avgRating: 4.5,
                icon: Heart,
                color: "text-red-400",
                movies: ["The Dark Knight", "Inception", "Interstellar"],
              },
              {
                name: "Watchlist",
                count: 18,
                avgRating: 4.2,
                icon: Clock,
                color: "text-blue-400",
                movies: ["Dune: Part Two", "Oppenheimer", "The Batman"],
              },
              {
                name: "Action Movies",
                count: 32,
                avgRating: 4.3,
                icon: Film,
                color: "text-orange-400",
                movies: ["John Wick 4", "Mad Max: Fury Road", "Mission Impossible"],
              },
              {
                name: "Sci-Fi Classics",
                count: 15,
                avgRating: 4.7,
                icon: Star,
                color: "text-purple-400",
                movies: ["Blade Runner 2049", "The Matrix", "2001: A Space Odyssey"],
              },
            ].map((list, i) => {
              const IconComponent = list.icon
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 transition-all duration-300 hover:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gray-800/50 ${list.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-sm text-gray-400">{list.count} movies</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3].map((_, idx) => (
                        <div key={idx} className="w-12 h-16 bg-gray-700 rounded-md flex-shrink-0 overflow-hidden">
                          <img
                            src={`/placeholder.svg?height=64&width=48&query=movie poster ${list.movies[idx]}`}
                            alt={list.movies[idx]}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {list.count > 3 && (
                        <div className="w-12 h-16 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400">+{list.count - 3}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      {list.movies.slice(0, 2).map((movie, idx) => (
                        <div key={idx} className="truncate">
                          {movie}
                        </div>
                      ))}
                      {list.count > 2 && <div className="text-gray-500">and {list.count - 2} more...</div>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span className="text-sm font-medium text-gray-300">Avg: {list.avgRating}</span>
                    </div>
                    <div className="text-xs text-gray-500">Updated 2 days ago</div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500 transition-all duration-200 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View List
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
              <Film className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Create your first custom list</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Organize movies by genre, mood, or any theme you like. Share your curated collections with friends.
            </p>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
