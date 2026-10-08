import Image from "next/image";
import { cn } from "@/lib/utils";

export type BrandLogoSize = "header" | "sidebar" | "default";

export type BrandLogoProps = {
  className?: string;
  size?: BrandLogoSize;
};

const logoSizes: Record<BrandLogoSize, { className: string; sizes: string }> = {
  header: {
    className: "h-20 w-20 sm:h-24 sm:w-24",
    sizes: "(max-width: 639px) 80px, 96px",
  },
  sidebar: {
    className: "h-24 w-24 sm:h-28 sm:w-28",
    sizes: "(max-width: 639px) 96px, 112px",
  },
  default: {
    className: "h-32 w-32 sm:h-40 sm:w-40",
    sizes: "(max-width: 639px) 128px, 160px",
  },
};

export function BrandLogo({ className, size = "default" }: BrandLogoProps) {
  const dimensions = logoSizes[size];

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/verniq-ai-logo.png"
        alt="VERNIQ AI — Know where you are. Discover where you can go."
        priority
        width={1024}
        height={1024}
        sizes={dimensions.sizes}
        className={cn("block rounded-xl object-contain", dimensions.className)}
      />
    </span>
  );
}
