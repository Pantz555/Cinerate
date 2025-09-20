import Link from "next/link";
import { CineRateIcon } from "@/components/icons";
import HeaderActions from "./header-actions";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292d38] bg-[#111317]/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-10">
      {/* Logo and Brand */}
      <div className="flex items-center gap-4 text-white">
        <div className="h-8 w-8 text-[var(--primary-500)]">
          <CineRateIcon className="h-full w-full" />
        </div>
        <Link href="/">
          <h2 className="text-xl font-bold leading-tight tracking-tighter text-white hover:text-gray-300 transition-colors">
            CineRate
          </h2>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/"
          className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          Home
        </Link>
        <Link
          href="/discover"
          className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          Discover
        </Link>
        <Link
          href="/lists"
          className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          Lists
        </Link>
        <Link
          href="/community"
          className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          Community
        </Link>
      </nav>

      {/* Action Buttons and Profile */}
      <HeaderActions />
    </header>
  );
}
