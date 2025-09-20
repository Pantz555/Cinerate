"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, List, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: pathname === "/",
    },
    {
      href: "/discover",
      icon: Search,
      label: "Discover",
      isActive: pathname === "/discover",
    },
    {
      href: "/lists",
      icon: List,
      label: "Lists",
      isActive: pathname === "/lists",
    },
    {
      href: "/community",
      icon: Users,
      label: "Community",
      isActive: pathname === "/community",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      isActive: pathname === "/profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111317]/95 backdrop-blur-sm border-t border-[#292d38] md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                item.isActive ? "text-white bg-blue-600" : "text-gray-400 hover:text-gray-300",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
