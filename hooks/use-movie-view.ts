import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Generate a session ID for anonymous users (stored in sessionStorage)
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("viewSessionId");
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem("viewSessionId", sessionId);
  }
  return sessionId;
}

export function useMovieView(movieId: Id<"movies"> | undefined) {
  const trackView = useMutation(api.viewTracking.trackMovieView);
  const viewTracked = useRef(false);
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!movieId || viewTracked.current) return;

    // Track the view after a short delay to ensure it's not just a quick navigation
    const timer = setTimeout(() => {
      const sessionId = getOrCreateSessionId();
      trackView({ movieId, sessionId })
        .then(() => {
          viewTracked.current = true;
        })
        .catch(console.error);
    }, 3000); // Wait 3 seconds before tracking

    return () => clearTimeout(timer);
  }, [movieId, trackView]);

  // Track session duration when component unmounts
  useEffect(() => {
    return () => {
      if (movieId && viewTracked.current) {
        const sessionDuration = Math.floor(
          (Date.now() - sessionStartTime.current) / 1000,
        );
        const sessionId = getOrCreateSessionId();

        // Fire and forget - track duration on unmount
        trackView({
          movieId,
          sessionId,
          sessionDuration,
        }).catch(console.error);
      }
    };
  }, [movieId, trackView]);
}
