"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import {
  ConvexQueryCacheProvider,
  useQueries,
} from "convex-helpers/react/cache";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import BotButton from "./chat/chat-bot";

export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
      {/* <BotButton /> */}
    </ConvexAuthNextjsProvider>
  );
}
