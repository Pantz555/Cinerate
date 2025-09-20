"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useQueryWithStatus } from "./ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const HeaderActions = () => {
  const { data: user, isPending } = useQueryWithStatus(api.auth.loggedInUser);

  return (
    <div className="flex items-center gap-3">
      {isPending ? (
        <HeaderSkeleton />
      ) : user?._id ? (
        <>
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full bg-cover bg-center bg-no-repeat overflow-hidden hover:ring-2 hover:ring-[var(--primary-500)] transition-all">
              <Image
                src={user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6UwcqaUrDvlTwlgA1mUex0HCVXzwY-g6kvn6l9KE9oPsWP_PLWpXDE5nBIZfmvq6CzS3Bi3t6JQGTjNuDjXb6lqohJiP3TsAYjTpik7suRJJ6uerm-eMw84QUWSkEaD4jDU_blERy4ZCDIHTX5E6lifAWSoD8nJKcr0jxyNFXOTVBFgP4_oUmX_wWLj2t2M8MhX0YMc87TriC6f5-2OtSBKEQ7Hiecyxy-CA6wfUZEX5kg70Awjb9YmCqWJ1qO3D6Sb4kMekzkc"}
                alt="User profile"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
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
