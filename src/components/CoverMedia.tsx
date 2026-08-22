import { catalogCoverHref } from "@/lib/blob-access";

/** Full-bleed frame that shows the whole cover (no crop). */
export function CoverMedia({
  url,
  alt = "",
  ratio = "landscape",
}: {
  url?: string | null;
  alt?: string;
  ratio?: "landscape" | "portrait" | "wide";
}) {
  const src = catalogCoverHref(url);
  if (!src) return null;
  return (
    <div className={`imu-cover imu-cover--${ratio}`} aria-hidden={alt ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} className="imu-cover__img" src={src} />
    </div>
  );
}
