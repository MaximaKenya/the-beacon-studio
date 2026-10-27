import Image from "next/image";
import type { ProductShot } from "@/data/product-shots";

/**
 * Animated hero tour: laptop + phone, slow crossfade between screens and a gentle
 * vertical pan on tall shots. Pure CSS keyframes (pg-tour-*), transform/opacity only,
 * frozen on the first screen under prefers-reduced-motion. Server component.
 */
export function DeviceTour({
  name,
  desktop,
  mobile,
}: {
  name: string;
  desktop: ProductShot[];
  mobile: ProductShot[];
}) {
  const layers = (shots: ProductShot[], sizes: string, priorityFirst: boolean) =>
    shots.map((s, i) => {
      const view = s.device === "mobile" ? 844 / 390 : 10 / 16;
      const ratio = s.height / s.width;
      const tall = ratio > view + 0.05;
      // How far to pan (as % of the image's own height) so its bottom reaches the frame.
      const pan = tall ? `${(-(1 - view / ratio) * 100).toFixed(1)}%` : "0%";
      return (
        <div
          key={s.file}
          className={`pg-tour-layer pg-tour-n${shots.length} ${tall ? "pg-tour-pan" : ""}`}
          data-i={i}
          style={{ ["--pan" as string]: pan }}
          aria-hidden={i > 0 ? true : undefined}
        >
          <Image
            src={s.file}
            alt={i === 0 ? s.alt : ""}
            width={s.width}
            height={s.height}
            sizes={sizes}
            priority={priorityFirst && i === 0}
            loading={priorityFirst && i === 0 ? undefined : "lazy"}
            placeholder="blur"
            blurDataURL={s.blurDataURL}
            className="block w-full"
          />
        </div>
      );
    });

  const hasDesk = desktop.length > 0;
  const hasPhone = mobile.length > 0;
  return (
    <figure className="pg-tour" aria-label={`${name} screens, animated tour`}>
      {hasDesk ? (
        <div className="pg-tour-laptop">
          <div className="pg-browser">
            <div className="pg-browser-bar" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="pg-browser-screen relative aspect-[16/10]">
              {layers(desktop, "(min-width: 1024px) 520px, 92vw", true)}
            </div>
          </div>
        </div>
      ) : null}
      {hasPhone ? (
        <div className={hasDesk ? "pg-tour-phone" : "pg-tour-phone pg-tour-phone-solo"}>
          <div className="pg-phone">
            <div className="pg-phone-screen relative aspect-[390/844]">
              {layers(mobile, "180px", !hasDesk)}
            </div>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
