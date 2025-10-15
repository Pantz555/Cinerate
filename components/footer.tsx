import Link from "next/link";
import { CineRateIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="dark:bg-[#0a0b0e] border-t dark:border-gray-800 bg-gray-200 border-border mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 text-blue-500">
                <CineRateIcon className="h-full w-full" />
              </div>
              <h3 className="text-xl font-bold">CineRate</h3>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed">
              Your ultimate destination for discovering, rating, and discussing
              movies with a passionate community of film enthusiasts.
            </p>
          </div>

          {/* Discover Section */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Discover
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Browse Movies
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?sort=trending"
                  className="text-sm text-muted-foreground dark:text-gray-400  transition-colors"
                >
                  Trending Now
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?sort=top-rated"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Top Rated
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?sort=new"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  New Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Community
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/community"
                  className="text-sm text-muted-foreground dark:text-gray-400  transition-colors"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/lists"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Lists
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Your Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              About
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground dark:text-gray-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} CineRate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
