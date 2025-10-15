"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react";
import React from "react";

const UserProfile = () => {
  const { data: user } = useQuery(api.auth.loggedInUser);
  return (
    <div
      className="size-8 shrink-0 rounded-full bg-gray-200 dark:bg-[#292d38] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: user?.image ? `url("${user.image}")` : undefined,
      }}
    >
      {!user?.image && (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
