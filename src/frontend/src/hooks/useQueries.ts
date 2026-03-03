import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  MediaFile,
  SearchResult,
  SectionConfig,
  Service,
  SiteContent,
  Testimonial,
  ThemeSettings,
  VideoEntry,
} from "../backend";
import { GlowIntensity, VideoPlatform, VideoType } from "../backend";
import { useActor } from "./useActor";

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private browsing — ignore
  }
}

// Helper: store plain numbers in localStorage but satisfy TypeScript's bigint types
function n(v: number): bigint {
  return v as unknown as bigint;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Reels", slug: "reels" },
  { id: "cat-2", name: "YouTube Shorts", slug: "youtube-shorts" },
  { id: "cat-3", name: "Ads", slug: "ads" },
  { id: "cat-4", name: "Gaming", slug: "gaming" },
  { id: "cat-5", name: "Cinematic", slug: "cinematic" },
];

const SEED_VIDEOS: VideoEntry[] = [
  {
    id: "vid-1",
    title: "Cinematic Travel Reel — Bali Golden Hour",
    featured: false,
    duration: n(60),
    thumbnailUrl: "",
    order: n(1),
    views: n(124000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "reels",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now()),
  },
  {
    id: "vid-2",
    title: "Gaming Highlights Montage — Epic Clutch Moments",
    featured: false,
    duration: n(58),
    thumbnailUrl: "",
    order: n(2),
    views: n(87500),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "gaming",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now() - 86400000 * 2),
  },
  {
    id: "vid-3",
    title: "Brand Ad — Luxury Perfume Product Film",
    featured: false,
    duration: n(30),
    thumbnailUrl: "",
    order: n(3),
    views: n(212000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "ads",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now() - 86400000 * 5),
  },
  {
    id: "vid-4",
    title: "Full Documentary — Street Photography in Tokyo",
    featured: true,
    duration: n(1800),
    thumbnailUrl: "",
    order: n(4),
    views: n(345000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "cinematic",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now() - 86400000 * 10),
  },
  {
    id: "vid-5",
    title: "YouTube Channel Trailer — Creator Studio 2024",
    featured: false,
    duration: n(720),
    thumbnailUrl: "",
    order: n(5),
    views: n(67800),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "youtube-shorts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now() - 86400000 * 15),
  },
  {
    id: "vid-6",
    title: "Cinematic Short Film — The Last Frame",
    featured: false,
    duration: n(960),
    thumbnailUrl: "",
    order: n(6),
    views: n(189000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "cinematic",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: n(Date.now() - 86400000 * 20),
  },
];

const SEED_SERVICES: Service[] = [
  {
    id: "svc-1",
    title: "Video Editing",
    order: n(1),
    icon: "🎬",
    description:
      "Professional cut, color grade, and audio mix for any content type. Fast turnaround, cinematic quality.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-2",
    title: "Color Grading",
    order: n(2),
    icon: "🎨",
    description:
      "Hollywood-grade color correction and creative grading. Your footage, elevated to cinematic standards.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-3",
    title: "Motion Graphics",
    order: n(3),
    icon: "✨",
    description:
      "Dynamic title cards, animated overlays, and brand motion assets that elevate your visual identity.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-4",
    title: "YouTube Content",
    order: n(4),
    icon: "📺",
    description:
      "End-to-end YouTube video editing optimized for retention — hooks, pacing, thumbnails, chapters.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-5",
    title: "Reels & Shorts",
    order: n(5),
    icon: "🎵",
    description:
      "Punchy short-form vertical content for Instagram Reels, YouTube Shorts, and TikTok. Beat-synced cuts.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-6",
    title: "Thumbnail Design",
    order: n(6),
    icon: "🖼️",
    description:
      "Click-worthy custom thumbnails with brand consistency. A/B tested designs that boost CTR.",
    visible: true,
    pricing: "",
  },
];

const SEED_SITE_CONTENT: SiteContent = {
  heroHeading: "Professional Video Editor",
  heroName: "RISHAV",
  heroTagline: "Crafting high-retention videos for creators & brands.",
  whatsappNumber: "9395889127",
  whatsappMessage: "Hi Rishav! I'd like to discuss a video project.",
  aboutText:
    "I'm Rishav, a passionate video editor with 5+ years of experience crafting compelling visual stories.",
  aboutSubtext:
    "From cinematic long-form documentaries to punchy short-form reels, I bring your vision to life.",
  logoUrl: "",
  faviconUrl: "",
  seoTitle: "Rishav — Professional Video Editor",
  seoDescription: "Crafting high-retention videos for creators & brands.",
  seoKeywords: "video editor, reels, youtube, content creator",
  profileImageUrl: "",
  aboutStat1Value: "5+",
  aboutStat1Label: "Years Experience",
  aboutStat2Value: "200+",
  aboutStat2Label: "Projects Done",
  aboutStat3Value: "50M+",
  aboutStat3Label: "Views Generated",
  heroButtonText: "View Portfolio",
  heroButtonLink: "",
  viewPortfolioText: "View Portfolio",
};

const SEED_SECTION_CONFIG: SectionConfig = {
  heroEnabled: true,
  shortformEnabled: true,
  longformEnabled: true,
  featuredEnabled: true,
  servicesEnabled: true,
  aboutEnabled: true,
  contactEnabled: true,
  testimonialsEnabled: true,
};

const SEED_TESTIMONIALS: Testimonial[] = [];

// ─── localStorage keys ────────────────────────────────────────────────────────

const LS = {
  videos: "rishav_videos",
  categories: "rishav_categories",
  services: "rishav_services",
  siteContent: "rishav_site_content",
  themeSettings: "rishav_theme_settings",
  mediaFiles: "rishav_media_files",
  testimonials: "rishav_testimonials",
  sectionConfig: "rishav_section_config",
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoEntry[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      // localStorage first
      const ls = lsGet<VideoEntry[]>(LS.videos);
      if (ls && ls.length > 0) return ls;

      if (!actor) {
        lsSet(LS.videos, SEED_VIDEOS);
        return SEED_VIDEOS;
      }
      try {
        const vids = await actor.getAllVideos();
        if (vids.length === 0) {
          await Promise.all(SEED_VIDEOS.map((v) => actor.createVideo(v)));
          lsSet(LS.videos, SEED_VIDEOS);
          return SEED_VIDEOS;
        }
        lsSet(LS.videos, vids);
        return vids;
      } catch {
        lsSet(LS.videos, SEED_VIDEOS);
        return SEED_VIDEOS;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_VIDEOS,
  });
}

export function useAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const ls = lsGet<Category[]>(LS.categories);
      if (ls && ls.length > 0) return ls;

      if (!actor) {
        lsSet(LS.categories, SEED_CATEGORIES);
        return SEED_CATEGORIES;
      }
      try {
        const cats = await actor.getAllCategories();
        if (cats.length === 0) {
          await Promise.all(
            SEED_CATEGORIES.map((c) => actor.createCategory(c)),
          );
          lsSet(LS.categories, SEED_CATEGORIES);
          return SEED_CATEGORIES;
        }
        lsSet(LS.categories, cats);
        return cats;
      } catch {
        lsSet(LS.categories, SEED_CATEGORIES);
        return SEED_CATEGORIES;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_CATEGORIES,
  });
}

export function useAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const ls = lsGet<Service[]>(LS.services);
      if (ls && ls.length > 0) return ls;

      if (!actor) {
        lsSet(LS.services, SEED_SERVICES);
        return SEED_SERVICES;
      }
      try {
        const svcs = await actor.getAllServices();
        if (svcs.length === 0) {
          await Promise.all(SEED_SERVICES.map((s) => actor.createService(s)));
          lsSet(LS.services, SEED_SERVICES);
          return SEED_SERVICES;
        }
        lsSet(LS.services, svcs);
        return svcs;
      } catch {
        lsSet(LS.services, SEED_SERVICES);
        return SEED_SERVICES;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_SERVICES,
  });
}

export function useSiteContent() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteContent>({
    queryKey: ["siteContent"],
    queryFn: async () => {
      const ls = lsGet<SiteContent>(LS.siteContent);
      if (ls) return ls;

      if (!actor) {
        lsSet(LS.siteContent, SEED_SITE_CONTENT);
        return SEED_SITE_CONTENT;
      }
      try {
        const content = await actor.getSiteContent();
        lsSet(LS.siteContent, content);
        return content;
      } catch {
        lsSet(LS.siteContent, SEED_SITE_CONTENT);
        return SEED_SITE_CONTENT;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_SITE_CONTENT,
  });
}

export function useThemeSettings() {
  const { actor, isFetching } = useActor();
  const defaultTheme: ThemeSettings = {
    accentColor: "#00e5ff",
    darkMode: true,
    glowIntensity: GlowIntensity.medium,
  };
  return useQuery<ThemeSettings>({
    queryKey: ["themeSettings"],
    queryFn: async () => {
      const ls = lsGet<ThemeSettings>(LS.themeSettings);
      if (ls) return ls;

      if (!actor) {
        lsSet(LS.themeSettings, defaultTheme);
        return defaultTheme;
      }
      try {
        const t = await actor.getThemeSettings();
        lsSet(LS.themeSettings, t);
        return t;
      } catch {
        lsSet(LS.themeSettings, defaultTheme);
        return defaultTheme;
      }
    },
    enabled: !isFetching,
    placeholderData: defaultTheme,
  });
}

export function useAllMediaFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaFile[]>({
    queryKey: ["mediaFiles"],
    queryFn: async () => {
      const ls = lsGet<MediaFile[]>(LS.mediaFiles);
      if (ls) return ls;

      if (!actor) return [];
      try {
        const files = await actor.getAllMediaFiles();
        lsSet(LS.mediaFiles, files);
        return files;
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
    placeholderData: [],
  });
}

export function useSearch(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SearchResult>({
    queryKey: ["search", keyword],
    queryFn: async () => {
      if (!actor || !keyword) return { services: [], videos: [] };
      try {
        return await actor.search(keyword);
      } catch {
        return { services: [], videos: [] };
      }
    },
    enabled: !!actor && !isFetching && !!keyword,
    placeholderData: { services: [], videos: [] },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !isFetching,
  });
}

// ─── Mutations (all use localStorage — no backend auth required) ──────────────

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (video: VideoEntry) => {
      const current = lsGet<VideoEntry[]>(LS.videos) ?? SEED_VIDEOS;
      const updated = [...current, video];
      lsSet(LS.videos, updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, video }: { id: string; video: VideoEntry }) => {
      const current = lsGet<VideoEntry[]>(LS.videos) ?? [];
      const updated = current.map((v) => (v.id === id ? video : v));
      lsSet(LS.videos, updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = lsGet<VideoEntry[]>(LS.videos) ?? [];
      lsSet(
        LS.videos,
        current.filter((v) => v.id !== id),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: Category) => {
      const current = lsGet<Category[]>(LS.categories) ?? SEED_CATEGORIES;
      lsSet(LS.categories, [...current, cat]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, cat }: { id: string; cat: Category }) => {
      const current = lsGet<Category[]>(LS.categories) ?? [];
      lsSet(
        LS.categories,
        current.map((c) => (c.id === id ? cat : c)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = lsGet<Category[]>(LS.categories) ?? [];
      lsSet(
        LS.categories,
        current.filter((c) => c.id !== id),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (svc: Service) => {
      const current = lsGet<Service[]>(LS.services) ?? SEED_SERVICES;
      lsSet(LS.services, [...current, svc]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, svc }: { id: string; svc: Service }) => {
      const current = lsGet<Service[]>(LS.services) ?? [];
      lsSet(
        LS.services,
        current.map((s) => (s.id === id ? svc : s)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = lsGet<Service[]>(LS.services) ?? [];
      lsSet(
        LS.services,
        current.filter((s) => s.id !== id),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const current: SiteContent =
        lsGet<SiteContent>(LS.siteContent) ?? SEED_SITE_CONTENT;
      const updated = { ...current, [key]: value };
      lsSet(LS.siteContent, updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteContent"] }),
  });
}

export function useUpdateThemeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: ThemeSettings) => {
      lsSet(LS.themeSettings, settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themeSettings"] }),
  });
}

export function useAddMediaFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (media: MediaFile) => {
      const current = lsGet<MediaFile[]>(LS.mediaFiles) ?? [];
      lsSet(LS.mediaFiles, [...current, media]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mediaFiles"] }),
  });
}

export function useAiProxy() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (prompt: string) => actor!.aiProxy(prompt),
  });
}

export function useAllTestimonials() {
  const { actor, isFetching } = useActor();
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const ls = lsGet<Testimonial[]>(LS.testimonials);
      if (ls) return ls;

      if (!actor) return SEED_TESTIMONIALS;
      try {
        const t = await actor.getAllTestimonials();
        lsSet(LS.testimonials, t);
        return t;
      } catch {
        return SEED_TESTIMONIALS;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_TESTIMONIALS,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Testimonial) => {
      const current = lsGet<Testimonial[]>(LS.testimonials) ?? [];
      lsSet(LS.testimonials, [...current, t]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      testimonial,
    }: { id: string; testimonial: Testimonial }) => {
      const current = lsGet<Testimonial[]>(LS.testimonials) ?? [];
      lsSet(
        LS.testimonials,
        current.map((t) => (t.id === id ? testimonial : t)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = lsGet<Testimonial[]>(LS.testimonials) ?? [];
      lsSet(
        LS.testimonials,
        current.filter((t) => t.id !== id),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useSectionConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<SectionConfig>({
    queryKey: ["sectionConfig"],
    queryFn: async () => {
      const ls = lsGet<SectionConfig>(LS.sectionConfig);
      if (ls) return ls;

      if (!actor) {
        lsSet(LS.sectionConfig, SEED_SECTION_CONFIG);
        return SEED_SECTION_CONFIG;
      }
      try {
        const cfg = await actor.getSectionConfig();
        lsSet(LS.sectionConfig, cfg);
        return cfg;
      } catch {
        lsSet(LS.sectionConfig, SEED_SECTION_CONFIG);
        return SEED_SECTION_CONFIG;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_SECTION_CONFIG,
  });
}

export function useUpdateSectionConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: SectionConfig) => {
      lsSet(LS.sectionConfig, config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sectionConfig"] }),
  });
}
