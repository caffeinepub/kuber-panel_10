// Global logo cache — preloads logos once at module load, never re-fetches
export const LOGO1_SRC =
  "/assets/uploads/IMG_20260311_153614_686-removebg-preview-1-3.png";
export const LOGO2_SRC = "/assets/uploads/IMG_20260311_153559_128-1.jpg";

// Eagerly preload both images at module init time
if (typeof window !== "undefined") {
  const link1 = document.createElement("link");
  link1.rel = "preload";
  link1.as = "image";
  link1.href = LOGO1_SRC;
  document.head.appendChild(link1);

  const link2 = document.createElement("link");
  link2.rel = "preload";
  link2.as = "image";
  link2.href = LOGO2_SRC;
  document.head.appendChild(link2);
}

export function getLogoSrc(): string {
  return LOGO1_SRC;
}
