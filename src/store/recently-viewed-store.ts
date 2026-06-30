import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentState {
  slugs: string[];
  add: (slug: string) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      slugs: [],
      add: (slug) =>
        set((state) => ({
          slugs: [slug, ...state.slugs.filter((s) => s !== slug)].slice(0, 8),
        })),
    }),
    { name: "recently-viewed" }
  )
);
