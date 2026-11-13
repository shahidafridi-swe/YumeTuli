import { cx } from "@/components/ui";

/** Shows a transparent logo on a light and a dark swatch, so both versions can be judged. */
export function LogoPreview({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) return <div className={cx("flex items-center justify-center rounded-md border border-dashed border-strong text-xs text-muted", className)}>—</div>;
  return (
    <div className={cx("grid grid-cols-2 overflow-hidden rounded-md border border-border", className)}>
      <div className="relative min-h-0 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL from the API */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-contain p-3" />
      </div>
      <div className="relative min-h-0 bg-[#141318]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain p-3" />
      </div>
    </div>
  );
}
