import { cn } from "@/lib/utils";

export type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  variant?: "dark" | "light";
  showTagline?: boolean;
};

export function BrandLogo({
  className,
  compact = false,
  variant = "dark",
  showTagline = false,
}: BrandLogoProps) {
  const wordmarkClass =
    variant === "dark"
      ? "text-white drop-shadow-[0_0_18px_rgba(66,157,255,0.35)]"
      : "text-current drop-shadow-[0_0_10px_rgba(66,157,255,0.12)]";

  return (
    <div className={cn("flex items-center gap-3 text-slate-900 dark:text-slate-50", className)}>
      <svg
        aria-label="VERNIQ AI logo"
        viewBox="0 0 520 420"
        className={cn(compact ? "h-16 w-16 sm:h-20 sm:w-20" : "h-28 w-28 sm:h-36 sm:w-36", "shrink-0")}
        role="img"
      >
        <defs>
          <linearGradient id="verniqMarkGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8f5cff" />
            <stop offset="35%" stopColor="#4a9dff" />
            <stop offset="68%" stopColor="#42d7ff" />
            <stop offset="100%" stopColor="#93f4ff" />
          </linearGradient>
          <linearGradient id="verniqRibbonGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#6938ff" />
            <stop offset="45%" stopColor="#4f9efc" />
            <stop offset="100%" stopColor="#6fe7ff" />
          </linearGradient>
          <filter id="verniqGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#verniqGlow)">
          <path
            d="M122 58L234 268C244 284 256 291 274 291C301 291 324 279 343 251L434 110C443 96 429 77 413 80L338 97C327 99 319 107 315 117L244 252L200 168L181 92C177 76 163 63 146 60L122 58Z"
            fill="url(#verniqMarkGradient)"
            opacity="0.96"
          />
          <path
            d="M58 245C110 294 173 308 230 272C289 235 319 182 323 123C327 74 311 41 282 27C243 9 190 18 142 61C112 91 86 129 66 175C52 206 45 229 58 245Z"
            fill="url(#verniqRibbonGradient)"
            opacity="0.95"
          />
          <path
            d="M67 228C96 265 130 288 174 292C261 300 318 248 334 195"
            fill="none"
            stroke="url(#verniqMarkGradient)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M110 82C135 122 170 151 225 177"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>

      <div className="flex flex-col justify-center">
        <span
          className={cn(
            "tracking-[-0.14em] font-black leading-[0.8]",
            compact ? "text-[1.2rem] sm:text-[1.8rem]" : "text-[2rem] sm:text-[4.2rem]",
            wordmarkClass,
          )}
        >
          VERNIQ AI
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 text-[0.6rem] font-medium uppercase tracking-[0.28em] sm:text-[0.72rem]",
              variant === "dark" ? "text-slate-200/80" : "text-slate-600",
            )}
          >
            Know where you are. Discover where you can go.
          </span>
        ) : null}
      </div>
    </div>
  );
}
