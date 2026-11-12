import { useVideoConfig } from "remotion";

// Video formats. "vertical" = 9:16 Shorts/Reels/TikTok, "landscape" = 16:9 YouTube.
export type VideoFormat = "vertical" | "landscape";

export const FORMATS: Record<VideoFormat, { width: number; height: number }> = {
  vertical: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

// Thumbnails: vertical keeps the frame size; landscape uses YouTube's 1280×720.
export const THUMB_SIZES: Record<VideoFormat, { width: number; height: number }> = {
  vertical: { width: 1080, height: 1920 },
  landscape: { width: 1280, height: 720 },
};

/** Current frame size and whether it is landscape (works in any composition). */
export const useFormat = () => {
  const { width, height } = useVideoConfig();
  return { width, height, landscape: width > height };
};
