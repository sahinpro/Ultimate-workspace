/** Landscape / abstract Unsplash backgrounds — no people. */
export const BACKGROUNDS = {
  /** Snowy mountain peaks at night */
  aurora: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=80",
  /** Misty mountain valley */
  mist: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80",
  /** Alpine lake */
  alpine: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80",
  /** Abstract blue gradient mesh */
  mesh: "https://images.unsplash.com/photo-1557683316-973673bdad71?auto=format&fit=crop&w=2400&q=80",
} as const;

export type BackgroundKey = keyof typeof BACKGROUNDS;
