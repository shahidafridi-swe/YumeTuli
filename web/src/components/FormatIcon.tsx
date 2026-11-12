import type { VideoFormat } from "@/lib/types";

/** Outline of the frame shape: tall for vertical, wide for landscape. */
export function FormatIcon({ format, className, title }: { format: VideoFormat; className?: string; title?: string }) {
  const r = format === "vertical" ? { x: 7, y: 2, w: 10, h: 20 } : { x: 2, y: 6.5, w: 20, h: 11 };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={1.8} />
    </svg>
  );
}
