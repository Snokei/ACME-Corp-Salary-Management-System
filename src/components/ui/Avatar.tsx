"use client";

import Image from "next/image";
import { useState } from "react";

export interface AvatarProps {
  /** Primary image URL. */
  src?: string | null;
  /** Accessible alternative text. */
  alt: string;
  /** Square size in pixels, used for the intrinsic width/height. */
  size: number;
  /** Optional fallback URL used when the primary image fails to load. */
  fallbackSrc?: string;
  /** Additional class names applied to the underlying image element. */
  className?: string;
  /** Whether to eagerly load the image (e.g. above-the-fold avatars). */
  priority?: boolean;
}

/**
 * Accessible avatar wrapper around `next/image` that transparently swaps to a
 * fallback image when the primary source fails to load.
 */
export function Avatar({
  src,
  alt,
  size,
  fallbackSrc,
  className,
  priority = false,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Track the failed source rather than a boolean so a new `src` prop
  // automatically resets the fallback state.
  const imageSrc = src && src !== failedSrc ? src : fallbackSrc || src || "";

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={className}
      onError={() => {
        if (src && src !== fallbackSrc) {
          setFailedSrc(src);
        }
      }}
    />
  );
}
