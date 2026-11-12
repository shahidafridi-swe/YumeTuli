"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, json } from "@/lib/api";
import type { Paginated, Run, RunEvent, Series, User, Video } from "@/lib/types";

export const keys = {
  me: ["me"] as const,
  series: ["series"] as const,
  videos: (params: string) => ["videos", params] as const,
  video: (id: number) => ["video", id] as const,
  runs: (videoId: number) => ["runs", videoId] as const,
  events: (runId: number) => ["events", runId] as const,
};

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api<{ data: User }>("me").then((r) => r.data) });

export const useSeriesList = () =>
  useQuery({ queryKey: keys.series, queryFn: () => api<{ data: Series[] }>("series").then((r) => r.data) });

export const useVideos = (params: URLSearchParams) =>
  useQuery({
    queryKey: keys.videos(params.toString()),
    queryFn: () => api<Paginated<Video>>(`videos?${params}`),
    placeholderData: (prev) => prev,
  });

export const useVideo = (id: number) =>
  useQuery({ queryKey: keys.video(id), queryFn: () => api<{ data: Video }>(`videos/${id}`).then((r) => r.data) });

export const useRuns = (videoId: number) =>
  useQuery({ queryKey: keys.runs(videoId), queryFn: () => api<{ data: Run[] }>(`videos/${videoId}/runs`).then((r) => r.data) });

export const useRunEvents = (runId: number | undefined) =>
  useQuery({
    queryKey: keys.events(runId ?? 0),
    enabled: !!runId,
    queryFn: () => api<{ data: RunEvent[] }>(`runs/${runId}/events`).then((r) => r.data),
  });

/** POST /videos/{id}/{action}; refreshes the video and its runs afterwards. */
export function useVideoAction(videoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, body }: { action: "plan" | "approve" | "feedback" | "retry" | "cancel" | "ready"; body?: unknown }) =>
      api(`videos/${videoId}/${action}`, { method: "POST", ...(body ? json(body) : {}) }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.video(videoId) });
      qc.invalidateQueries({ queryKey: keys.runs(videoId) });
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
