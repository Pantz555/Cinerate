"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useQueryWithStatus } from "./ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import UserProfile from "./user-profile";

const HeaderActions = () => {
  const { data: user, isPending } = useQueryWithStatus(api.auth.loggedInUser);

  return (
    <div className="flex items-center gap-3">
      {isPending ? (
        <HeaderSkeleton />
      ) : user?._id ? (
        <>
          {user.role && "admin" && (
            <Link href="/admin">
              <div className="">
                Admin panel
              </div>
            </Link>
          )}
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden hover:ring-2 hover:ring-[var(--primary-500)] transition-all">
              <UserProfile />
            </div>
          </Link>
        </>
      ) : (
        <Link className="text-primary hover:underline" href="/auth">
          Signin
        </Link>
      )}
    </div>
  );
};

export default HeaderActions;

export function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-3">
      {/* Profile Image Skeleton */}
      <div
        className={cn("h-10 w-10 rounded-full bg-[#292d38] animate-pulse")}
      />
    </div>
  );
}
