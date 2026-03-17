import { memo } from "react";
import { LOGO1_SRC, LOGO2_SRC } from "../utils/logoCache";

// Module-level fallback step — once a logo fails, all future mounts skip it
let _globalStep: 0 | 1 | 2 = 0;

// Stable reference: once set, the img element src never changes
const StableLogo = memo(function StableLogo({
  size = 88,
  glow = false,
  spin = false,
  className = "",
}: {
  size?: number;
  glow?: boolean;
  spin?: boolean;
  className?: string;
}) {
  // Use the global step to determine which logo to show
  // We read _globalStep once and do NOT use useState — this avoids all re-render flicker
  const step = _globalStep;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Move to next fallback and update global step
    const next = step === 0 ? 1 : (2 as 0 | 1 | 2);
    _globalStep = next;
    // Force the img src to change
    const img = e.currentTarget;
    if (next === 1) {
      img.src = LOGO2_SRC;
    } else {
      // Cannot show gold K in img, swap to hidden and show fallback
      img.style.display = "none";
      const parent = img.parentElement;
      if (parent) {
        const fallback = document.createElement("div");
        fallback.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#f5c842);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(size * 0.45)}px;color:#000;flex-shrink:0;`;
        fallback.textContent = "K";
        parent.appendChild(fallback);
      }
    }
  };

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    objectFit: "contain",
    transform: "translateZ(0)",
    willChange: "auto",
    backfaceVisibility: "hidden",
    flexShrink: 0,
    display: step === 2 ? "none" : "block",
    ...(glow
      ? {
          filter:
            "drop-shadow(0 0 14px rgba(0,170,255,0.35)) drop-shadow(0 0 6px rgba(0,120,220,0.2))",
        }
      : {}),
    ...(spin ? { animation: "spin 5s linear infinite" } : {}),
  };

  if (step === 2) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-black flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #d4a017, #f5c842)",
          color: "#000",
          fontSize: size * 0.45,
          flexShrink: 0,
        }}
      >
        K
      </div>
    );
  }

  return (
    <img
      src={step === 0 ? LOGO1_SRC : LOGO2_SRC}
      alt="KUBER PANEL"
      loading="eager"
      fetchPriority="high"
      width={size}
      height={size}
      className={className}
      style={baseStyle}
      onError={handleError}
    />
  );
});

export default StableLogo;
