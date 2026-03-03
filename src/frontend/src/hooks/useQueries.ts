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
    duration: BigInt(60),
    thumbnailUrl: "",
    order: BigInt(1),
    views: BigInt(124000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "reels",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "vid-2",
    title: "Gaming Highlights Montage — Epic Clutch Moments",
    featured: false,
    duration: BigInt(58),
    thumbnailUrl: "",
    order: BigInt(2),
    views: BigInt(87500),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "gaming",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt((Date.now() - 86400000 * 2) * 1_000_000),
  },
  {
    id: "vid-3",
    title: "Brand Ad — Luxury Perfume Product Film",
    featured: false,
    duration: BigInt(30),
    thumbnailUrl: "",
    order: BigInt(3),
    views: BigInt(212000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.short_,
    category: "ads",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt((Date.now() - 86400000 * 5) * 1_000_000),
  },
  {
    id: "vid-4",
    title: "Full Documentary — Street Photography in Tokyo",
    featured: true,
    duration: BigInt(1800),
    thumbnailUrl: "",
    order: BigInt(4),
    views: BigInt(345000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "cinematic",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt((Date.now() - 86400000 * 10) * 1_000_000),
  },
  {
    id: "vid-5",
    title: "YouTube Channel Trailer — Creator Studio 2024",
    featured: false,
    duration: BigInt(720),
    thumbnailUrl: "",
    order: BigInt(5),
    views: BigInt(67800),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "youtube-shorts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt((Date.now() - 86400000 * 15) * 1_000_000),
  },
  {
    id: "vid-6",
    title: "Cinematic Short Film — The Last Frame",
    featured: false,
    duration: BigInt(960),
    thumbnailUrl: "",
    order: BigInt(6),
    views: BigInt(189000),
    platform: VideoPlatform.youtube,
    videoType: VideoType.long_,
    category: "cinematic",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadDate: BigInt((Date.now() - 86400000 * 20) * 1_000_000),
  },
];

const SEED_SERVICES: Service[] = [
  {
    id: "svc-1",
    title: "Video Editing",
    order: BigInt(1),
    icon: "🎬",
    description:
      "Professional cut, color grade, and audio mix for any content type. Fast turnaround, cinematic quality.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-2",
    title: "Color Grading",
    order: BigInt(2),
    icon: "🎨",
    description:
      "Hollywood-grade color correction and creative grading. Your footage, elevated to cinematic standards.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-3",
    title: "Motion Graphics",
    order: BigInt(3),
    icon: "✨",
    description:
      "Dynamic title cards, animated overlays, and brand motion assets that elevate your visual identity.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-4",
    title: "YouTube Content",
    order: BigInt(4),
    icon: "📺",
    description:
      "End-to-end YouTube video editing optimized for retention — hooks, pacing, thumbnails, chapters.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-5",
    title: "Reels & Shorts",
    order: BigInt(5),
    icon: "🎵",
    description:
      "Punchy short-form vertical content for Instagram Reels, YouTube Shorts, and TikTok. Beat-synced cuts.",
    visible: true,
    pricing: "",
  },
  {
    id: "svc-6",
    title: "Thumbnail Design",
    order: BigInt(6),
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

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoEntry[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return SEED_VIDEOS;
      try {
        const vids = await actor.getAllVideos();
        if (vids.length === 0) {
          // Seed data
          await Promise.all(SEED_VIDEOS.map((v) => actor.createVideo(v)));
          return SEED_VIDEOS;
        }
        return vids;
      } catch {
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
      if (!actor) return SEED_CATEGORIES;
      try {
        const cats = await actor.getAllCategories();
        if (cats.length === 0) {
          await Promise.all(
            SEED_CATEGORIES.map((c) => actor.createCategory(c)),
          );
          return SEED_CATEGORIES;
        }
        return cats;
      } catch {
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
      if (!actor) return SEED_SERVICES;
      try {
        const svcs = await actor.getAllServices();
        if (svcs.length === 0) {
          await Promise.all(SEED_SERVICES.map((s) => actor.createService(s)));
          return SEED_SERVICES;
        }
        return svcs;
      } catch {
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
      if (!actor) return SEED_SITE_CONTENT;
      try {
        const content = await actor.getSiteContent();
        return content;
      } catch {
        return SEED_SITE_CONTENT;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_SITE_CONTENT,
  });
}

export function useThemeSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<ThemeSettings>({
    queryKey: ["themeSettings"],
    queryFn: async () => {
      if (!actor)
        return {
          accentColor: "#00e5ff",
          darkMode: true,
          glowIntensity: GlowIntensity.medium,
        };
      try {
        return await actor.getThemeSettings();
      } catch {
        return {
          accentColor: "#00e5ff",
          darkMode: true,
          glowIntensity: GlowIntensity.medium,
        };
      }
    },
    enabled: !isFetching,
    placeholderData: {
      accentColor: "#00e5ff",
      darkMode: true,
      glowIntensity: GlowIntensity.medium,
    },
  });
}

export function useAllMediaFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaFile[]>({
    queryKey: ["mediaFiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllMediaFiles();
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

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateVideo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (video: VideoEntry) => actor!.createVideo(video),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, video }: { id: string; video: VideoEntry }) =>
      actor!.updateVideo(id, video),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cat: Category) => actor!.createCategory(cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cat }: { id: string; cat: Category }) =>
      actor!.updateCategory(id, cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (svc: Service) => actor!.createService(svc),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, svc }: { id: string; svc: Service }) =>
      actor!.updateService(id, svc),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteService(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateSiteContent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      actor!.updateSiteContent(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteContent"] }),
  });
}

export function useUpdateThemeSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: ThemeSettings) =>
      actor!.updateThemeSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themeSettings"] }),
  });
}

export function useAddMediaFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (media: MediaFile) => actor!.addMediaFile(media),
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
      if (!actor) return SEED_TESTIMONIALS;
      try {
        return await actor.getAllTestimonials();
      } catch {
        return SEED_TESTIMONIALS;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_TESTIMONIALS,
  });
}

export function useCreateTestimonial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Testimonial) => actor!.createTestimonial(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      testimonial,
    }: { id: string; testimonial: Testimonial }) =>
      actor!.updateTestimonial(id, testimonial),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useSectionConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<SectionConfig>({
    queryKey: ["sectionConfig"],
    queryFn: async () => {
      if (!actor) return SEED_SECTION_CONFIG;
      try {
        return await actor.getSectionConfig();
      } catch {
        return SEED_SECTION_CONFIG;
      }
    },
    enabled: !isFetching,
    placeholderData: SEED_SECTION_CONFIG,
  });
}

export function useUpdateSectionConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: SectionConfig) => actor!.updateSectionConfig(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sectionConfig"] }),
  });
}
