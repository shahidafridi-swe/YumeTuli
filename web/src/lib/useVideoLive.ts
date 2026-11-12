"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { keys } from "@/lib/queries";
import type { RunEvent } from "@/lib/types";

type RunUpdated = { run: { id: number; status: string }; video: { id: number; status: string } };

/** Follows private-video.{id}: refreshes the video on status changes and appends log lines live. */
export function useVideoLive(videoId: number) {
  const qc = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !videoId) return;
    const channel = echo.private(`video.${videoId}`);

    channel.listen(".run.updated", (e: RunUpdated) => {
      qc.invalidateQueries({ queryKey: keys.video(videoId) });
      qc.invalidateQueries({ queryKey: keys.runs(videoId) });
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: keys.events(e.run.id) });
    });

    channel.listen(".run.event", (e: RunEvent) => {
      qc.setQueryData<RunEvent[]>(keys.events(e.run_id), (old) => {
        if (!old) return old; // not loaded yet: the first fetch will include it
        return old.some((x) => x.id === e.id) ? old : [...old, e];
      });
    });

    // After a reconnect, catch up on anything missed.
    channel.subscribed(() => {
      qc.invalidateQueries({ queryKey: keys.video(videoId) });
      qc.invalidateQueries({ queryKey: ["events"] });
    });

    return () => echo.leave(`video.${videoId}`);
  }, [videoId, qc]);
}
