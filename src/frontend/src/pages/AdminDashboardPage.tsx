import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Check,
  Edit3,
  Film,
  Globe,
  Home,
  Image,
  Loader2,
  LogOut,
  Menu,
  Palette,
  Phone,
  Play,
  Plus,
  Save,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type {
  Category,
  SectionConfig,
  Service,
  Testimonial,
  ThemeSettings,
  VideoEntry,
} from "../backend";
import { GlowIntensity, VideoPlatform, VideoType } from "../backend";
import {
  useAddMediaFile,
  useAiProxy,
  useAllCategories,
  useAllMediaFiles,
  useAllServices,
  useAllTestimonials,
  useAllVideos,
  useCreateCategory,
  useCreateService,
  useCreateTestimonial,
  useCreateVideo,
  useDeleteCategory,
  useDeleteService,
  useDeleteTestimonial,
  useDeleteVideo,
  useSectionConfig,
  useSiteContent,
  useThemeSettings,
  useUpdateCategory,
  useUpdateSectionConfig,
  useUpdateService,
  useUpdateSiteContent,
  useUpdateTestimonial,
  useUpdateThemeSettings,
  useUpdateVideo,
} from "../hooks/useQueries";

// ─── Section types ────────────────────────────────────────────────────────────

type AdminSection =
  | "hero"
  | "shortform"
  | "longform"
  | "categories"
  | "services"
  | "about"
  | "contact"
  | "theme"
  | "media"
  | "ai"
  | "testimonials"
  | "global";

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode }[] =
  [
    { id: "hero", label: "Hero", icon: <Home size={16} /> },
    { id: "shortform", label: "Short Form", icon: <Play size={16} /> },
    { id: "longform", label: "Long Form", icon: <Film size={16} /> },
    { id: "categories", label: "Categories", icon: <Tag size={16} /> },
    { id: "services", label: "Services", icon: <Briefcase size={16} /> },
    { id: "about", label: "About", icon: <User size={16} /> },
    { id: "contact", label: "Contact", icon: <Phone size={16} /> },
    { id: "theme", label: "Theme", icon: <Palette size={16} /> },
    { id: "media", label: "Media Library", icon: <Image size={16} /> },
    { id: "ai", label: "AI Studio", icon: <Sparkles size={16} /> },
    { id: "testimonials", label: "Testimonials", icon: <Star size={16} /> },
    { id: "global", label: "Global Control", icon: <Globe size={16} /> },
  ];

// ─── Shared components ────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2
        className="text-2xl font-bold mb-1"
        style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          color: "oklch(0.95 0.01 240)",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm" style={{ color: "oklch(0.5 0.02 240)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function AdminCard({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: "oklch(0.1 0.005 240)",
        border: "1px solid oklch(0.2 0.012 240)",
      }}
    >
      {children}
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dataOcid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dataOcid?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span
          className="text-xs font-medium"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          {label}
        </span>
        <input
          data-ocid={dataOcid}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: "oklch(0.08 0.004 240)",
            border: "1px solid oklch(0.2 0.012 240)",
            color: "oklch(0.88 0.01 240)",
            caretColor: "var(--neon)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "oklch(0.82 0.22 193 / 0.5)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "oklch(0.2 0.012 240)";
          }}
        />
      </label>
    </div>
  );
}

function AdminTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  dataOcid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  dataOcid?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span
          className="text-xs font-medium"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          {label}
        </span>
        <textarea
          data-ocid={dataOcid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
          style={{
            background: "oklch(0.08 0.004 240)",
            border: "1px solid oklch(0.2 0.012 240)",
            color: "oklch(0.88 0.01 240)",
            caretColor: "var(--neon)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "oklch(0.82 0.22 193 / 0.5)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "oklch(0.2 0.012 240)";
          }}
        />
      </label>
    </div>
  );
}

function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span
          className="text-xs font-medium"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          {label}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
          style={{
            background: "oklch(0.08 0.004 240)",
            border: "1px solid oklch(0.2 0.012 240)",
            color: "oklch(0.88 0.01 240)",
          }}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: "oklch(0.08 0.004 240)" }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

// ─── SAVE BUTTON ──────────────────────────────────────────────────────────────

function SaveButton({
  onClick,
  isPending,
  label = "Save Changes",
  dataOcid,
}: {
  onClick: () => void;
  isPending: boolean;
  label?: string;
  dataOcid?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={dataOcid ?? "admin.save_button"}
      onClick={onClick}
      disabled={isPending}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 w-fit"
      style={{
        background: "oklch(0.82 0.22 193 / 0.15)",
        border: "1px solid oklch(0.82 0.22 193 / 0.4)",
        color: "var(--neon)",
      }}
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Save size={14} />
      )}
      {isPending ? "Saving..." : label}
    </button>
  );
}

// ─── HERO CONTROL ─────────────────────────────────────────────────────────────

function HeroSection() {
  const { data: content } = useSiteContent();
  const { mutate: updateContent, isPending } = useUpdateSiteContent();
  const [fields, setFields] = useState({
    heroHeading: "",
    heroName: "",
    heroTagline: "",
    whatsappNumber: "",
    whatsappMessage: "",
    viewPortfolioText: "",
  });

  useEffect(() => {
    if (content) {
      setFields({
        heroHeading: content.heroHeading,
        heroName: content.heroName,
        heroTagline: content.heroTagline,
        whatsappNumber: content.whatsappNumber,
        whatsappMessage: content.whatsappMessage,
        viewPortfolioText: content.viewPortfolioText || "View Portfolio",
      });
    }
  }, [content]);

  const handleSave = async () => {
    const updates = Object.entries(fields);
    await Promise.all(
      updates.map(([key, value]) => updateContent({ key, value })),
    );
    toast.success("Hero content saved!");
  };

  return (
    <div data-ocid="admin_hero.section">
      <SectionHeader
        title="Hero Control"
        subtitle="Edit the portfolio homepage hero section"
      />
      <AdminCard>
        <div className="grid gap-4">
          <AdminInput
            label="Heading"
            value={fields.heroHeading}
            onChange={(v) => setFields((p) => ({ ...p, heroHeading: v }))}
            placeholder="Professional Video Editor"
            dataOcid="admin_hero.heroheading_input"
          />
          <AdminInput
            label="Name"
            value={fields.heroName}
            onChange={(v) => setFields((p) => ({ ...p, heroName: v }))}
            placeholder="RISHAV"
            dataOcid="admin_hero.heroname_input"
          />
          <AdminInput
            label="Tagline"
            value={fields.heroTagline}
            onChange={(v) => setFields((p) => ({ ...p, heroTagline: v }))}
            placeholder="Crafting high-retention videos..."
            dataOcid="admin_hero.herotagline_input"
          />
          <AdminInput
            label="WhatsApp Number"
            value={fields.whatsappNumber}
            onChange={(v) => setFields((p) => ({ ...p, whatsappNumber: v }))}
            placeholder="9395889127"
            dataOcid="admin_hero.whatsappnumber_input"
          />
          <AdminInput
            label="WhatsApp Message"
            value={fields.whatsappMessage}
            onChange={(v) => setFields((p) => ({ ...p, whatsappMessage: v }))}
            placeholder="Hi Rishav! I'd like to discuss a project."
            dataOcid="admin_hero.whatsappmessage_input"
          />
          <AdminInput
            label="View Portfolio Button Text"
            value={fields.viewPortfolioText}
            onChange={(v) => setFields((p) => ({ ...p, viewPortfolioText: v }))}
            placeholder="View Portfolio"
            dataOcid="admin_hero.viewportfoliotext_input"
          />
          <div className="pt-2">
            <SaveButton onClick={handleSave} isPending={isPending} />
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

// ─── VIDEO FORM ───────────────────────────────────────────────────────────────

function VideoForm({
  initial,
  videoType,
  categories,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: Partial<VideoEntry>;
  videoType: VideoType;
  categories: Category[];
  onSubmit: (v: VideoEntry) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<VideoEntry>({
    id: initial?.id ?? crypto.randomUUID(),
    title: initial?.title ?? "",
    videoUrl: initial?.videoUrl ?? "",
    thumbnailUrl: initial?.thumbnailUrl ?? "",
    platform: initial?.platform ?? VideoPlatform.youtube,
    category: initial?.category ?? categories[0]?.slug ?? "",
    views: initial?.views ?? BigInt(0),
    duration: initial?.duration ?? BigInt(0),
    featured: initial?.featured ?? false,
    videoType,
    order: initial?.order ?? BigInt(0),
    uploadDate: initial?.uploadDate ?? BigInt(Date.now() * 1_000_000),
  });

  const set = (k: keyof VideoEntry, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-4">
      <AdminInput
        label="Title"
        value={form.title}
        onChange={(v) => set("title", v)}
        placeholder="Video title"
      />
      <AdminInput
        label="Video URL (YouTube / upload URL)"
        value={form.videoUrl}
        onChange={(v) => set("videoUrl", v)}
        placeholder="https://www.youtube.com/watch?v=..."
      />
      <AdminInput
        label="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={(v) => set("thumbnailUrl", v)}
        placeholder="https://..."
      />
      <AdminSelect
        label="Platform"
        value={form.platform}
        onChange={(v) => set("platform", v as VideoPlatform)}
        options={[
          { value: VideoPlatform.youtube, label: "YouTube" },
          { value: VideoPlatform.upload, label: "Upload" },
          { value: VideoPlatform.instagram, label: "Instagram" },
        ]}
      />
      <AdminSelect
        label="Category"
        value={form.category}
        onChange={(v) => set("category", v)}
        options={[
          { value: "", label: "Uncategorized" },
          ...categories.map((c) => ({ value: c.slug, label: c.name })),
        ]}
      />
      <AdminInput
        label="Views"
        value={String(Number(form.views))}
        onChange={(v) => set("views", BigInt(Number.parseInt(v) || 0))}
        type="number"
        placeholder="0"
      />
      {videoType === VideoType.long_ && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="sr-only"
          />
          <div
            className="relative w-10 h-6 rounded-full transition-colors duration-200"
            style={{
              background: form.featured
                ? "oklch(0.82 0.22 193 / 0.3)"
                : "oklch(0.14 0.008 240)",
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
              style={{
                background: form.featured
                  ? "var(--neon)"
                  : "oklch(0.35 0.01 240)",
                transform: form.featured
                  ? "translateX(20px)"
                  : "translateX(4px)",
              }}
            />
          </div>
          <span className="text-sm" style={{ color: "oklch(0.7 0.02 240)" }}>
            Featured Video
          </span>
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSubmit(form)}
          disabled={isPending || !form.title || !form.videoUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: "oklch(0.82 0.22 193 / 0.15)",
            border: "1px solid oklch(0.82 0.22 193 / 0.4)",
            color: "var(--neon)",
          }}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
          style={{
            background: "oklch(0.12 0.006 240)",
            border: "1px solid oklch(0.2 0.012 240)",
            color: "oklch(0.55 0.02 240)",
          }}
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── VIDEO MANAGER ────────────────────────────────────────────────────────────

function VideoManager({ videoType }: { videoType: VideoType }) {
  const isShort = videoType === VideoType.short_;
  const { data: videos = [] } = useAllVideos();
  const { data: categories = [] } = useAllCategories();
  const { mutate: createVideo, isPending: creating } = useCreateVideo();
  const { mutate: updateVideo, isPending: updating } = useUpdateVideo();
  const { mutate: deleteVideo } = useDeleteVideo();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = videos.filter((v) => v.videoType === videoType);

  const sectionId = isShort ? "admin_shortform" : "admin_longform";

  return (
    <div data-ocid={`${sectionId}.section`}>
      <SectionHeader
        title={isShort ? "Short Form Manager" : "Long Form Manager"}
        subtitle={`Manage ${isShort ? "vertical" : "horizontal"} video content`}
      />

      <div className="mb-4">
        <button
          type="button"
          data-ocid={`${sectionId}.add_button`}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "oklch(0.82 0.22 193 / 0.1)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "var(--neon)",
          }}
        >
          <Plus size={16} />
          Add Video
        </button>
      </div>

      {showAdd && (
        <AdminCard className="mb-4">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "oklch(0.82 0.01 240)" }}
          >
            Add New Video
          </h3>
          <VideoForm
            videoType={videoType}
            categories={categories}
            onSubmit={(v) => {
              createVideo(v, {
                onSuccess: () => {
                  setShowAdd(false);
                  toast.success("Video added!");
                },
                onError: () => toast.error("Failed to add video"),
              });
            }}
            onCancel={() => setShowAdd(false)}
            isPending={creating}
          />
        </AdminCard>
      )}

      {/* Video list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            data-ocid={`${sectionId}.empty_state`}
            className="text-center py-12 rounded-xl"
            style={{
              background: "oklch(0.09 0.004 240)",
              border: "1px dashed oklch(0.22 0.012 240)",
              color: "oklch(0.45 0.02 240)",
            }}
          >
            <Film size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos yet. Add your first one!</p>
          </div>
        ) : (
          filtered.map((v, i) => (
            <AdminCard key={v.id} className="space-y-0">
              <div data-ocid={`${sectionId}.item.${i + 1}`}>
                {editingId === v.id ? (
                  <div>
                    <h4
                      className="text-sm font-semibold mb-4"
                      style={{ color: "oklch(0.82 0.01 240)" }}
                    >
                      Edit Video
                    </h4>
                    <VideoForm
                      initial={v}
                      videoType={videoType}
                      categories={categories}
                      onSubmit={(updated) => {
                        updateVideo(
                          { id: v.id, video: updated },
                          {
                            onSuccess: () => {
                              setEditingId(null);
                              toast.success("Video updated!");
                            },
                            onError: () =>
                              toast.error("Failed to update video"),
                          },
                        );
                      }}
                      onCancel={() => setEditingId(null)}
                      isPending={updating}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* Thumbnail preview */}
                    <div
                      className="w-16 h-10 rounded-lg flex-shrink-0"
                      style={{
                        background: v.thumbnailUrl
                          ? `url(${v.thumbnailUrl}) center/cover`
                          : "oklch(0.15 0.08 200)",
                        border: "1px solid oklch(0.2 0.012 240)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "oklch(0.88 0.01 240)" }}
                      >
                        {v.title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.48 0.02 240)" }}
                      >
                        {v.platform} • {v.category || "uncategorized"} •{" "}
                        {Number(v.views).toLocaleString()} views
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        data-ocid={`${sectionId}.edit_button.${i + 1}`}
                        onClick={() => setEditingId(v.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          color: "oklch(0.6 0.02 240)",
                          background: "oklch(0.14 0.008 240)",
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        data-ocid={`${sectionId}.delete_button.${i + 1}`}
                        onClick={() => {
                          if (confirm(`Delete "${v.title}"?`)) {
                            deleteVideo(v.id, {
                              onSuccess: () => toast.success("Video deleted"),
                              onError: () => toast.error("Failed to delete"),
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          color: "oklch(0.7 0.18 25)",
                          background: "oklch(0.7 0.22 25 / 0.1)",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}

// ─── CATEGORY MANAGER ────────────────────────────────────────────────────────

function CategoryManager() {
  const { data: categories = [] } = useAllCategories();
  const { mutate: createCat, isPending: creating } = useCreateCategory();
  const { mutate: updateCat, isPending: updating } = useUpdateCategory();
  const { mutate: deleteCat } = useDeleteCategory();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  return (
    <div data-ocid="admin_categories.section">
      <SectionHeader
        title="Category Manager"
        subtitle="Manage video categories and filters"
      />

      <div className="mb-4">
        <button
          type="button"
          data-ocid="admin_categories.add_button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "oklch(0.82 0.22 193 / 0.1)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "var(--neon)",
          }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {showAdd && (
        <AdminCard className="mb-4">
          <div className="grid gap-3">
            <AdminInput
              label="Category Name"
              value={form.name}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  name: v,
                  slug: v.toLowerCase().replace(/\s+/g, "-"),
                }))
              }
              placeholder="e.g. Gaming"
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
              placeholder="e.g. gaming"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!form.name) return;
                  createCat(
                    {
                      id: crypto.randomUUID(),
                      name: form.name,
                      slug: form.slug,
                    },
                    {
                      onSuccess: () => {
                        setShowAdd(false);
                        setForm({ name: "", slug: "" });
                        toast.success("Category added!");
                      },
                    },
                  );
                }}
                disabled={creating || !form.name}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{
                  background: "oklch(0.82 0.22 193 / 0.15)",
                  border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                  color: "var(--neon)",
                }}
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.12 0.006 240)",
                  border: "1px solid oklch(0.2 0.012 240)",
                  color: "oklch(0.55 0.02 240)",
                }}
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <AdminCard key={cat.id}>
            <div
              data-ocid={`admin_categories.item.${i + 1}`}
              className="flex items-center gap-4"
            >
              {editingId === cat.id ? (
                <div className="flex-1 grid gap-3">
                  <AdminInput
                    label="Name"
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    placeholder="Category name"
                  />
                  <AdminInput
                    label="Slug"
                    value={form.slug}
                    onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
                    placeholder="category-slug"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateCat(
                          {
                            id: cat.id,
                            cat: { ...cat, name: form.name, slug: form.slug },
                          },
                          {
                            onSuccess: () => {
                              setEditingId(null);
                              toast.success("Updated!");
                            },
                          },
                        );
                      }}
                      disabled={updating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        background: "oklch(0.82 0.22 193 / 0.15)",
                        border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                        color: "var(--neon)",
                      }}
                    >
                      {updating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{
                        background: "oklch(0.12 0.006 240)",
                        border: "1px solid oklch(0.2 0.012 240)",
                        color: "oklch(0.55 0.02 240)",
                      }}
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.88 0.01 240)" }}
                    >
                      {cat.name}
                    </p>
                    <p
                      className="text-xs mt-0.5 font-mono"
                      style={{ color: "oklch(0.48 0.02 240)" }}
                    >
                      /{cat.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`admin_categories.edit_button.${i + 1}`}
                      onClick={() => {
                        setEditingId(cat.id);
                        setForm({ name: cat.name, slug: cat.slug });
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        color: "oklch(0.6 0.02 240)",
                        background: "oklch(0.14 0.008 240)",
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin_categories.delete_button.${i + 1}`}
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}"?`)) {
                          deleteCat(cat.id, {
                            onSuccess: () => toast.success("Category deleted"),
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        color: "oklch(0.7 0.18 25)",
                        background: "oklch(0.7 0.22 25 / 0.1)",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

// ─── SERVICES MANAGER ────────────────────────────────────────────────────────

function ServicesManager() {
  const { data: services = [] } = useAllServices();
  const { mutate: createSvc, isPending: creating } = useCreateService();
  const { mutate: updateSvc, isPending: updating } = useUpdateService();
  const { mutate: deleteSvc } = useDeleteService();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "🎬",
    order: "0",
    pricing: "",
    visible: true,
  });

  return (
    <div data-ocid="admin_services.section">
      <SectionHeader
        title="Services Manager"
        subtitle="Manage the services displayed on your portfolio"
      />

      <div className="mb-4">
        <button
          type="button"
          data-ocid="admin_services.add_button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{
            background: "oklch(0.82 0.22 193 / 0.1)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "var(--neon)",
          }}
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {showAdd && (
        <AdminCard className="mb-4">
          <div className="grid gap-3">
            <AdminInput
              label="Icon (emoji)"
              value={form.icon}
              onChange={(v) => setForm((p) => ({ ...p, icon: v }))}
              placeholder="🎬"
            />
            <AdminInput
              label="Title"
              value={form.title}
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="Video Editing"
            />
            <AdminTextarea
              label="Description"
              value={form.description}
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
              rows={3}
            />
            <AdminInput
              label="Pricing (e.g. Starting from $200)"
              value={form.pricing}
              onChange={(v) => setForm((p) => ({ ...p, pricing: v }))}
              placeholder="Starting from $200"
            />
            <AdminInput
              label="Order"
              type="number"
              value={form.order}
              onChange={(v) => setForm((p) => ({ ...p, order: v }))}
              placeholder="1"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) =>
                  setForm((p) => ({ ...p, visible: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className="relative w-10 h-6 rounded-full transition-colors duration-200"
                style={{
                  background: form.visible
                    ? "oklch(0.82 0.22 193 / 0.3)"
                    : "oklch(0.14 0.008 240)",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
                  style={{
                    background: form.visible
                      ? "var(--neon)"
                      : "oklch(0.35 0.01 240)",
                    transform: form.visible
                      ? "translateX(20px)"
                      : "translateX(4px)",
                  }}
                />
              </div>
              <span
                className="text-sm"
                style={{ color: "oklch(0.7 0.02 240)" }}
              >
                Visible on portfolio
              </span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!form.title) return;
                  createSvc(
                    {
                      id: crypto.randomUUID(),
                      title: form.title,
                      description: form.description,
                      icon: form.icon,
                      order: BigInt(Number.parseInt(form.order) || 0),
                      pricing: form.pricing,
                      visible: form.visible,
                    },
                    {
                      onSuccess: () => {
                        setShowAdd(false);
                        setForm({
                          title: "",
                          description: "",
                          icon: "🎬",
                          order: "0",
                          pricing: "",
                          visible: true,
                        });
                        toast.success("Service added!");
                      },
                    },
                  );
                }}
                disabled={creating || !form.title}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{
                  background: "oklch(0.82 0.22 193 / 0.15)",
                  border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                  color: "var(--neon)",
                }}
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.12 0.006 240)",
                  border: "1px solid oklch(0.2 0.012 240)",
                  color: "oklch(0.55 0.02 240)",
                }}
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="space-y-2">
        {services.map((svc, i) => (
          <AdminCard key={svc.id}>
            <div data-ocid={`admin_services.item.${i + 1}`}>
              {editingId === svc.id ? (
                <div className="grid gap-3">
                  <AdminInput
                    label="Icon"
                    value={form.icon}
                    onChange={(v) => setForm((p) => ({ ...p, icon: v }))}
                  />
                  <AdminInput
                    label="Title"
                    value={form.title}
                    onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                  />
                  <AdminTextarea
                    label="Description"
                    value={form.description}
                    onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                    rows={3}
                  />
                  <AdminInput
                    label="Pricing"
                    value={form.pricing}
                    onChange={(v) => setForm((p) => ({ ...p, pricing: v }))}
                    placeholder="Starting from $200"
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, visible: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    <div
                      className="relative w-10 h-6 rounded-full transition-colors duration-200"
                      style={{
                        background: form.visible
                          ? "oklch(0.82 0.22 193 / 0.3)"
                          : "oklch(0.14 0.008 240)",
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
                        style={{
                          background: form.visible
                            ? "var(--neon)"
                            : "oklch(0.35 0.01 240)",
                          transform: form.visible
                            ? "translateX(20px)"
                            : "translateX(4px)",
                        }}
                      />
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: "oklch(0.7 0.02 240)" }}
                    >
                      Visible on portfolio
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateSvc(
                          {
                            id: svc.id,
                            svc: {
                              ...svc,
                              title: form.title,
                              description: form.description,
                              icon: form.icon,
                              order: BigInt(Number.parseInt(form.order) || 0),
                              pricing: form.pricing,
                              visible: form.visible,
                            },
                          },
                          {
                            onSuccess: () => {
                              setEditingId(null);
                              toast.success("Updated!");
                            },
                          },
                        );
                      }}
                      disabled={updating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        background: "oklch(0.82 0.22 193 / 0.15)",
                        border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                        color: "var(--neon)",
                      }}
                    >
                      {updating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{
                        background: "oklch(0.12 0.006 240)",
                        border: "1px solid oklch(0.2 0.012 240)",
                        color: "oklch(0.55 0.02 240)",
                      }}
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{svc.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.88 0.01 240)" }}
                      >
                        {svc.title}
                      </p>
                      {svc.visible === false && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "oklch(0.7 0.22 25 / 0.15)",
                            border: "1px solid oklch(0.7 0.22 25 / 0.3)",
                            color: "oklch(0.7 0.18 25)",
                          }}
                        >
                          Hidden
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mt-0.5 line-clamp-1"
                      style={{ color: "oklch(0.48 0.02 240)" }}
                    >
                      {svc.description}
                    </p>
                    {svc.pricing && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--neon)" }}
                      >
                        {svc.pricing}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`admin_services.edit_button.${i + 1}`}
                      onClick={() => {
                        setEditingId(svc.id);
                        setForm({
                          title: svc.title,
                          description: svc.description,
                          icon: svc.icon,
                          order: String(Number(svc.order)),
                          pricing: svc.pricing || "",
                          visible: svc.visible !== false,
                        });
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        color: "oklch(0.6 0.02 240)",
                        background: "oklch(0.14 0.008 240)",
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin_services.delete_button.${i + 1}`}
                      onClick={() => {
                        if (confirm(`Delete "${svc.title}"?`)) {
                          deleteSvc(svc.id, {
                            onSuccess: () => toast.success("Deleted!"),
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        color: "oklch(0.7 0.18 25)",
                        background: "oklch(0.7 0.22 25 / 0.1)",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

// ─── ABOUT EDITOR ─────────────────────────────────────────────────────────────

function AboutEditor() {
  const { data: content } = useSiteContent();
  const { mutate: updateContent, isPending } = useUpdateSiteContent();
  const [fields, setFields] = useState({
    aboutText: "",
    aboutSubtext: "",
    profileImageUrl: "",
    aboutStat1Value: "",
    aboutStat1Label: "",
    aboutStat2Value: "",
    aboutStat2Label: "",
    aboutStat3Value: "",
    aboutStat3Label: "",
  });

  useEffect(() => {
    if (content) {
      setFields({
        aboutText: content.aboutText,
        aboutSubtext: content.aboutSubtext,
        profileImageUrl: content.profileImageUrl || "",
        aboutStat1Value: content.aboutStat1Value || "5+",
        aboutStat1Label: content.aboutStat1Label || "Years Experience",
        aboutStat2Value: content.aboutStat2Value || "200+",
        aboutStat2Label: content.aboutStat2Label || "Projects Done",
        aboutStat3Value: content.aboutStat3Value || "50M+",
        aboutStat3Label: content.aboutStat3Label || "Views Generated",
      });
    }
  }, [content]);

  const handleSave = async () => {
    await Promise.all(
      Object.entries(fields).map(([key, value]) =>
        updateContent({ key, value }),
      ),
    );
    toast.success("About section saved!");
  };

  return (
    <div data-ocid="admin_about.section">
      <SectionHeader
        title="About Editor"
        subtitle="Update your about section text, stats and profile image"
      />
      <AdminCard>
        <div className="grid gap-4">
          <AdminTextarea
            label="Main About Text"
            value={fields.aboutText}
            onChange={(v) => setFields((p) => ({ ...p, aboutText: v }))}
            rows={5}
            dataOcid="admin_about.text_input"
          />
          <AdminTextarea
            label="Subtext / Extended Bio"
            value={fields.aboutSubtext}
            onChange={(v) => setFields((p) => ({ ...p, aboutSubtext: v }))}
            rows={4}
            dataOcid="admin_about.subtext_input"
          />
          <AdminInput
            label="Profile Image URL"
            value={fields.profileImageUrl}
            onChange={(v) => setFields((p) => ({ ...p, profileImageUrl: v }))}
            placeholder="https://example.com/photo.jpg"
            dataOcid="admin_about.profileimage_input"
          />

          {/* Stats */}
          <div>
            <p
              className="text-xs font-medium mb-3"
              style={{ color: "oklch(0.55 0.02 240)" }}
            >
              Stats
            </p>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Stat 1 Value"
                  value={fields.aboutStat1Value}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat1Value: v }))
                  }
                  placeholder="5+"
                />
                <AdminInput
                  label="Stat 1 Label"
                  value={fields.aboutStat1Label}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat1Label: v }))
                  }
                  placeholder="Years Experience"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Stat 2 Value"
                  value={fields.aboutStat2Value}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat2Value: v }))
                  }
                  placeholder="200+"
                />
                <AdminInput
                  label="Stat 2 Label"
                  value={fields.aboutStat2Label}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat2Label: v }))
                  }
                  placeholder="Projects Done"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Stat 3 Value"
                  value={fields.aboutStat3Value}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat3Value: v }))
                  }
                  placeholder="50M+"
                />
                <AdminInput
                  label="Stat 3 Label"
                  value={fields.aboutStat3Label}
                  onChange={(v) =>
                    setFields((p) => ({ ...p, aboutStat3Label: v }))
                  }
                  placeholder="Views Generated"
                />
              </div>
            </div>
          </div>

          <SaveButton
            onClick={handleSave}
            isPending={isPending}
            dataOcid="admin_about.save_button"
          />
        </div>
      </AdminCard>
    </div>
  );
}

// ─── CONTACT SETTINGS ─────────────────────────────────────────────────────────

function ContactSettings() {
  const { data: content } = useSiteContent();
  const { mutate: updateContent, isPending } = useUpdateSiteContent();
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (content) {
      setNumber(content.whatsappNumber);
      setMessage(content.whatsappMessage);
    }
  }, [content]);

  const handleSave = async () => {
    await Promise.all([
      updateContent({ key: "whatsappNumber", value: number }),
      updateContent({ key: "whatsappMessage", value: message }),
    ]);
    toast.success("Contact settings saved!");
  };

  return (
    <div data-ocid="admin_contact.section">
      <SectionHeader
        title="Contact Settings"
        subtitle="Configure your WhatsApp contact details"
      />
      <AdminCard>
        <div className="grid gap-4">
          <AdminInput
            label="WhatsApp Number (without + or spaces)"
            value={number}
            onChange={setNumber}
            placeholder="9395889127"
          />
          <AdminTextarea
            label="Default WhatsApp Message"
            value={message}
            onChange={setMessage}
            rows={3}
          />
          <SaveButton onClick={handleSave} isPending={isPending} />
        </div>
      </AdminCard>
    </div>
  );
}

// ─── THEME SETTINGS ───────────────────────────────────────────────────────────

function ThemeSettingsPanel() {
  const { data: theme } = useThemeSettings();
  const { mutate: updateTheme, isPending } = useUpdateThemeSettings();
  const [settings, setSettings] = useState<ThemeSettings>({
    accentColor: "#00e5ff",
    darkMode: true,
    glowIntensity: GlowIntensity.medium,
  });

  useEffect(() => {
    if (theme) setSettings(theme);
  }, [theme]);

  const handleSave = () => {
    updateTheme(settings, {
      onSuccess: () => toast.success("Theme saved!"),
    });
  };

  return (
    <div data-ocid="admin_theme.section">
      <SectionHeader
        title="Theme Settings"
        subtitle="Customize the portfolio appearance"
      />
      <AdminCard>
        <div className="grid gap-5">
          {/* Accent color */}
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                Accent Color
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, accentColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer"
                  style={{
                    background: "oklch(0.08 0.004 240)",
                    border: "1px solid oklch(0.2 0.012 240)",
                  }}
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, accentColor: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg text-sm outline-none font-mono"
                  style={{
                    background: "oklch(0.08 0.004 240)",
                    border: "1px solid oklch(0.2 0.012 240)",
                    color: "oklch(0.88 0.01 240)",
                  }}
                />
              </div>
            </label>
          </div>

          {/* Glow intensity */}
          <AdminSelect
            label="Glow Intensity"
            value={settings.glowIntensity}
            onChange={(v) =>
              setSettings((p) => ({ ...p, glowIntensity: v as GlowIntensity }))
            }
            options={[
              { value: GlowIntensity.low, label: "Low" },
              { value: GlowIntensity.medium, label: "Medium" },
              { value: GlowIntensity.high, label: "High" },
            ]}
          />

          {/* Dark mode toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm" style={{ color: "oklch(0.7 0.02 240)" }}>
              Dark Mode
            </span>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, darkMode: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className="relative w-10 h-6 rounded-full transition-colors duration-200"
                style={{
                  background: settings.darkMode
                    ? "oklch(0.82 0.22 193 / 0.3)"
                    : "oklch(0.14 0.008 240)",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
                  style={{
                    background: settings.darkMode
                      ? "var(--neon)"
                      : "oklch(0.35 0.01 240)",
                    transform: settings.darkMode
                      ? "translateX(20px)"
                      : "translateX(4px)",
                  }}
                />
              </div>
            </div>
          </label>

          <SaveButton onClick={handleSave} isPending={isPending} />
        </div>
      </AdminCard>
    </div>
  );
}

// ─── MEDIA LIBRARY ────────────────────────────────────────────────────────────

function MediaLibrary() {
  const { data: files = [] } = useAllMediaFiles();
  const { mutate: addMedia, isPending } = useAddMediaFile();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // For the media library, we read file as data URL since we can't do real blob storage in this context
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        addMedia(
          {
            id: crypto.randomUUID(),
            blob: ExternalBlob.fromURL(url),
            name: file.name,
            uploadedAt: BigInt(Date.now() * 1_000_000),
          },
          {
            onSuccess: () => toast.success("File added to media library!"),
            onError: () => toast.error("Failed to add file"),
          },
        );
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-ocid="admin_media.section">
      <SectionHeader
        title="Media Library"
        subtitle="Manage reusable media files"
      />

      <div className="mb-6">
        <label
          data-ocid="admin_media.upload_button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer inline-flex"
          style={{
            background: "oklch(0.82 0.22 193 / 0.1)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "var(--neon)",
          }}
        >
          {uploading || isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </label>
      </div>

      {files.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{
            background: "oklch(0.09 0.004 240)",
            border: "1px dashed oklch(0.22 0.012 240)",
            color: "oklch(0.45 0.02 240)",
          }}
        >
          <Image size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No media files yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((f, _i) => (
            <div
              key={f.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: "oklch(0.1 0.005 240)",
                border: "1px solid oklch(0.2 0.012 240)",
              }}
            >
              <div
                className="aspect-square flex items-center justify-center"
                style={{ background: "oklch(0.12 0.006 240)" }}
              >
                <Image size={24} style={{ color: "oklch(0.45 0.02 240)" }} />
              </div>
              <div className="p-2">
                <p
                  className="text-xs truncate"
                  style={{ color: "oklch(0.65 0.02 240)" }}
                >
                  {f.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI STUDIO ────────────────────────────────────────────────────────────────

function AIStudio() {
  const { mutate: aiProxy } = useAiProxy();
  const [activeTab, setActiveTab] = useState<
    "title" | "bio" | "service" | "seo"
  >("title");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const TOOLS: {
    id: "title" | "bio" | "service" | "seo";
    label: string;
    placeholder: string;
    prompt: (v: string) => string;
  }[] = [
    {
      id: "title",
      label: "Title Generator",
      placeholder:
        "e.g. Gaming highlight reel, travel vlog, cooking tutorial...",
      prompt: (v) =>
        `Generate an SEO-optimized video title, description, and 5 tags for a video about: "${v}". Format as JSON with fields: title, description, tags (array).`,
    },
    {
      id: "bio",
      label: "Bio Writer",
      placeholder:
        "e.g. Video editor, 5 years experience, specializes in reels and YouTube...",
      prompt: (v) =>
        `Write 3 versions of a professional bio for a video editor: 1) Full professional bio (150 words), 2) Short bio (50 words), 3) Instagram bio (150 chars). Input: "${v}". Format as JSON: professionalBio, shortBio, instagramBio.`,
    },
    {
      id: "service",
      label: "Service Generator",
      placeholder: "e.g. color grading, motion graphics, reels editing...",
      prompt: (v) =>
        `Generate a service offering title and description for a video editor offering: "${v}". Format as JSON: title, description.`,
    },
    {
      id: "seo",
      label: "SEO Meta Generator",
      placeholder: "e.g. Homepage, Portfolio, Services page...",
      prompt: (v) =>
        `Generate SEO meta title and description for this page of a video editor's portfolio: "${v}". Format as JSON: metaTitle, metaDescription.`,
    },
  ];

  const currentTool = TOOLS.find((t) => t.id === activeTab)!;

  const handleGenerate = () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    aiProxy(currentTool.prompt(input), {
      onSuccess: (res) => {
        setResult(res);
        setLoading(false);
      },
      onError: () => {
        setResult("Failed to generate. Please try again.");
        setLoading(false);
      },
    });
  };

  const formatResult = (res: string) => {
    try {
      const parsed = JSON.parse(res);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return res;
    }
  };

  return (
    <div data-ocid="admin_ai.section">
      <SectionHeader
        title="AI Studio"
        subtitle="Free AI tools powered by your backend AI proxy"
      />

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TOOLS.map((tool) => (
          <button
            type="button"
            key={tool.id}
            onClick={() => {
              setActiveTab(tool.id);
              setInput("");
              setResult(null);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                activeTab === tool.id
                  ? "oklch(0.82 0.22 193 / 0.15)"
                  : "oklch(0.1 0.005 240)",
              border:
                activeTab === tool.id
                  ? "1px solid oklch(0.82 0.22 193 / 0.4)"
                  : "1px solid oklch(0.2 0.012 240)",
              color:
                activeTab === tool.id ? "var(--neon)" : "oklch(0.55 0.02 240)",
            }}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <AdminCard>
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "oklch(0.82 0.01 240)" }}
        >
          {currentTool.label}
        </h3>

        <AdminTextarea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder={currentTool.placeholder}
          rows={3}
        />

        <div className="mt-4">
          <button
            type="button"
            data-ocid={`admin_ai.${activeTab}_button`}
            onClick={handleGenerate}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "oklch(0.82 0.22 193 / 0.15)",
              border: "1px solid oklch(0.82 0.22 193 / 0.4)",
              color: "var(--neon)",
            }}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5"
          >
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "oklch(0.55 0.02 240)" }}
            >
              Generated Result
            </p>
            <pre
              className="p-4 rounded-xl text-xs overflow-x-auto"
              style={{
                background: "oklch(0.07 0.003 240)",
                border: "1px solid oklch(0.82 0.22 193 / 0.15)",
                color: "oklch(0.82 0.18 193)",
                fontFamily: '"Geist Mono", monospace',
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {formatResult(result)}
            </pre>
          </motion.div>
        )}
      </AdminCard>
    </div>
  );
}

// ─── TESTIMONIALS MANAGER ─────────────────────────────────────────────────────

function TestimonialsManager() {
  const { data: testimonials = [] } = useAllTestimonials();
  const { mutate: createT, isPending: creating } = useCreateTestimonial();
  const { mutate: updateT, isPending: updating } = useUpdateTestimonial();
  const { mutate: deleteT } = useDeleteTestimonial();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm = {
    clientName: "",
    clientImageUrl: "",
    review: "",
    rating: 5,
    order: "0",
  };
  const [form, setForm] = useState(emptyForm);

  const StarPicker = ({
    value,
    onChange,
  }: { value: number; onChange: (n: number) => void }) => (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs font-medium"
        style={{ color: "oklch(0.55 0.02 240)" }}
      >
        Rating
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className="transition-all"
            style={{
              color: n <= value ? "var(--neon)" : "oklch(0.3 0.01 240)",
              filter: n <= value ? "drop-shadow(0 0 4px var(--neon))" : "none",
            }}
          >
            <Star size={22} fill={n <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );

  const TestimonialForm = ({
    onSubmit,
    onCancel,
    isPending,
  }: {
    onSubmit: (t: Testimonial) => void;
    onCancel: () => void;
    isPending: boolean;
  }) => (
    <div className="grid gap-3">
      <AdminInput
        label="Client Name"
        value={form.clientName}
        onChange={(v) => setForm((p) => ({ ...p, clientName: v }))}
        placeholder="John Doe"
      />
      <AdminInput
        label="Client Image URL"
        value={form.clientImageUrl}
        onChange={(v) => setForm((p) => ({ ...p, clientImageUrl: v }))}
        placeholder="https://example.com/avatar.jpg"
      />
      <AdminTextarea
        label="Review"
        value={form.review}
        onChange={(v) => setForm((p) => ({ ...p, review: v }))}
        rows={3}
        placeholder="Amazing work! Highly recommend..."
      />
      <StarPicker
        value={form.rating}
        onChange={(n) => setForm((p) => ({ ...p, rating: n }))}
      />
      <AdminInput
        label="Order"
        type="number"
        value={form.order}
        onChange={(v) => setForm((p) => ({ ...p, order: v }))}
        placeholder="1"
      />
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() =>
            onSubmit({
              id: editingId ?? crypto.randomUUID(),
              clientName: form.clientName,
              clientImageUrl: form.clientImageUrl,
              review: form.review,
              rating: BigInt(form.rating),
              order: BigInt(Number.parseInt(form.order) || 0),
            })
          }
          disabled={isPending || !form.clientName || !form.review}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{
            background: "oklch(0.82 0.22 193 / 0.15)",
            border: "1px solid oklch(0.82 0.22 193 / 0.4)",
            color: "var(--neon)",
          }}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{
            background: "oklch(0.12 0.006 240)",
            border: "1px solid oklch(0.2 0.012 240)",
            color: "oklch(0.55 0.02 240)",
          }}
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div data-ocid="admin_testimonials.section">
      <SectionHeader
        title="Testimonials Manager"
        subtitle="Manage client reviews displayed on your portfolio"
      />

      <div className="mb-4">
        <button
          type="button"
          data-ocid="admin_testimonials.add_button"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowAdd(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{
            background: "oklch(0.82 0.22 193 / 0.1)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "var(--neon)",
          }}
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      </div>

      {showAdd && (
        <AdminCard className="mb-4">
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: "oklch(0.82 0.01 240)" }}
          >
            Add New Testimonial
          </h4>
          <TestimonialForm
            onSubmit={(t) => {
              createT(t, {
                onSuccess: () => {
                  setShowAdd(false);
                  setForm(emptyForm);
                  toast.success("Testimonial added!");
                },
                onError: () => toast.error("Failed to add testimonial"),
              });
            }}
            onCancel={() => setShowAdd(false)}
            isPending={creating}
          />
        </AdminCard>
      )}

      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <div
            data-ocid="admin_testimonials.empty_state"
            className="text-center py-12 rounded-xl"
            style={{
              background: "oklch(0.09 0.004 240)",
              border: "1px dashed oklch(0.22 0.012 240)",
              color: "oklch(0.45 0.02 240)",
            }}
          >
            <Star size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No testimonials yet. Add your first one!</p>
          </div>
        ) : (
          testimonials.map((t, i) => (
            <AdminCard key={t.id}>
              <div data-ocid={`admin_testimonials.item.${i + 1}`}>
                {editingId === t.id ? (
                  <div>
                    <h4
                      className="text-sm font-semibold mb-4"
                      style={{ color: "oklch(0.82 0.01 240)" }}
                    >
                      Edit Testimonial
                    </h4>
                    <TestimonialForm
                      onSubmit={(updated) => {
                        updateT(
                          { id: t.id, testimonial: updated },
                          {
                            onSuccess: () => {
                              setEditingId(null);
                              toast.success("Testimonial updated!");
                            },
                            onError: () => toast.error("Failed to update"),
                          },
                        );
                      }}
                      onCancel={() => setEditingId(null)}
                      isPending={updating}
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
                      style={{
                        background: t.clientImageUrl
                          ? `url(${t.clientImageUrl}) center/cover`
                          : "oklch(0.82 0.22 193 / 0.2)",
                        border: "1px solid oklch(0.82 0.22 193 / 0.3)",
                        color: "var(--neon)",
                      }}
                    >
                      {!t.clientImageUrl &&
                        t.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.88 0.01 240)" }}
                      >
                        {t.clientName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--neon)" }}>
                        {"★".repeat(Number(t.rating))}
                        {"☆".repeat(5 - Number(t.rating))}
                      </p>
                      <p
                        className="text-xs mt-1 line-clamp-2"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      >
                        {t.review}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        data-ocid={`admin_testimonials.edit_button.${i + 1}`}
                        onClick={() => {
                          setEditingId(t.id);
                          setForm({
                            clientName: t.clientName,
                            clientImageUrl: t.clientImageUrl,
                            review: t.review,
                            rating: Number(t.rating),
                            order: String(Number(t.order)),
                          });
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          color: "oklch(0.6 0.02 240)",
                          background: "oklch(0.14 0.008 240)",
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        data-ocid={`admin_testimonials.delete_button.${i + 1}`}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete testimonial from "${t.clientName}"?`,
                            )
                          ) {
                            deleteT(t.id, {
                              onSuccess: () =>
                                toast.success("Testimonial deleted"),
                              onError: () => toast.error("Failed to delete"),
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          color: "oklch(0.7 0.18 25)",
                          background: "oklch(0.7 0.22 25 / 0.1)",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}

// ─── GLOBAL CONTROL ───────────────────────────────────────────────────────────

function GlobalControl() {
  const { data: content } = useSiteContent();
  const { mutate: updateContent, isPending: savingContent } =
    useUpdateSiteContent();
  const { data: sectionConfig } = useSectionConfig();
  const { mutate: updateSectionConfig } = useUpdateSectionConfig();

  const [identity, setIdentity] = useState({ logoUrl: "", faviconUrl: "" });
  const [seo, setSeo] = useState({
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  useEffect(() => {
    if (content) {
      setIdentity({
        logoUrl: content.logoUrl || "",
        faviconUrl: content.faviconUrl || "",
      });
      setSeo({
        seoTitle: content.seoTitle || "",
        seoDescription: content.seoDescription || "",
        seoKeywords: content.seoKeywords || "",
      });
    }
  }, [content]);

  const handleSaveIdentity = async () => {
    await Promise.all([
      updateContent({ key: "logoUrl", value: identity.logoUrl }),
      updateContent({ key: "faviconUrl", value: identity.faviconUrl }),
    ]);
    toast.success("Website identity saved!");
  };

  const handleSaveSeo = async () => {
    await Promise.all([
      updateContent({ key: "seoTitle", value: seo.seoTitle }),
      updateContent({ key: "seoDescription", value: seo.seoDescription }),
      updateContent({ key: "seoKeywords", value: seo.seoKeywords }),
    ]);
    toast.success("SEO settings saved!");
  };

  const handleToggleSection = (key: keyof SectionConfig, value: boolean) => {
    if (!sectionConfig) return;
    const updated: SectionConfig = { ...sectionConfig, [key]: value };
    updateSectionConfig(updated, {
      onSuccess: () => toast.success("Section visibility updated!"),
      onError: () => toast.error("Failed to update"),
    });
  };

  const cfg = sectionConfig ?? {
    heroEnabled: true,
    shortformEnabled: true,
    longformEnabled: true,
    featuredEnabled: true,
    servicesEnabled: true,
    aboutEnabled: true,
    contactEnabled: true,
    testimonialsEnabled: true,
  };

  const SECTION_TOGGLES: { key: keyof SectionConfig; label: string }[] = [
    { key: "heroEnabled", label: "Hero" },
    { key: "shortformEnabled", label: "Short Form" },
    { key: "longformEnabled", label: "Long Form" },
    { key: "featuredEnabled", label: "Featured" },
    { key: "servicesEnabled", label: "Services" },
    { key: "aboutEnabled", label: "About" },
    { key: "testimonialsEnabled", label: "Testimonials" },
    { key: "contactEnabled", label: "Contact" },
  ];

  return (
    <div data-ocid="admin_global.section">
      <SectionHeader
        title="Global Control"
        subtitle="Website identity, SEO, and section visibility"
      />

      {/* Website Identity */}
      <AdminCard className="mb-5">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "oklch(0.82 0.01 240)" }}
        >
          Website Identity
        </h3>
        <div className="grid gap-3">
          <AdminInput
            label="Logo URL"
            value={identity.logoUrl}
            onChange={(v) => setIdentity((p) => ({ ...p, logoUrl: v }))}
            placeholder="https://example.com/logo.png"
            dataOcid="admin_global.logo_input"
          />
          <AdminInput
            label="Favicon URL"
            value={identity.faviconUrl}
            onChange={(v) => setIdentity((p) => ({ ...p, faviconUrl: v }))}
            placeholder="https://example.com/favicon.ico"
            dataOcid="admin_global.favicon_input"
          />
          <SaveButton
            onClick={handleSaveIdentity}
            isPending={savingContent}
            dataOcid="admin_global.identity_save_button"
          />
        </div>
      </AdminCard>

      {/* SEO Settings */}
      <AdminCard className="mb-5">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "oklch(0.82 0.01 240)" }}
        >
          SEO Settings
        </h3>
        <div className="grid gap-3">
          <AdminInput
            label="SEO Title"
            value={seo.seoTitle}
            onChange={(v) => setSeo((p) => ({ ...p, seoTitle: v }))}
            placeholder="Rishav — Professional Video Editor"
            dataOcid="admin_global.seotitle_input"
          />
          <AdminTextarea
            label="SEO Description"
            value={seo.seoDescription}
            onChange={(v) => setSeo((p) => ({ ...p, seoDescription: v }))}
            placeholder="Crafting high-retention videos for creators & brands."
            rows={3}
            dataOcid="admin_global.seodesc_textarea"
          />
          <AdminInput
            label="SEO Keywords (comma separated)"
            value={seo.seoKeywords}
            onChange={(v) => setSeo((p) => ({ ...p, seoKeywords: v }))}
            placeholder="video editor, reels, youtube"
            dataOcid="admin_global.seokeywords_input"
          />
          <SaveButton
            onClick={handleSaveSeo}
            isPending={savingContent}
            dataOcid="admin_global.seo_save_button"
          />
        </div>
      </AdminCard>

      {/* Section Visibility */}
      <AdminCard>
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "oklch(0.82 0.01 240)" }}
        >
          Section Visibility
        </h3>
        <div className="grid gap-3">
          {SECTION_TOGGLES.map((s) => (
            <label
              key={s.key}
              className="flex items-center justify-between cursor-pointer"
            >
              <span
                className="text-sm"
                style={{ color: "oklch(0.7 0.02 240)" }}
              >
                {s.label}
              </span>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={cfg[s.key] as boolean}
                  onChange={(e) => handleToggleSection(s.key, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="relative w-10 h-6 rounded-full transition-colors duration-200"
                  style={{
                    background: (cfg[s.key] as boolean)
                      ? "oklch(0.82 0.22 193 / 0.3)"
                      : "oklch(0.14 0.008 240)",
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
                    style={{
                      background: (cfg[s.key] as boolean)
                        ? "var(--neon)"
                        : "oklch(0.35 0.01 240)",
                      transform: (cfg[s.key] as boolean)
                        ? "translateX(20px)"
                        : "translateX(4px)",
                    }}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("hero");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard — check localStorage password auth
  useEffect(() => {
    if (!localStorage.getItem("admin_auth")) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate({ to: "/admin" });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "hero":
        return <HeroSection />;
      case "shortform":
        return <VideoManager videoType={VideoType.short_} />;
      case "longform":
        return <VideoManager videoType={VideoType.long_} />;
      case "categories":
        return <CategoryManager />;
      case "services":
        return <ServicesManager />;
      case "about":
        return <AboutEditor />;
      case "contact":
        return <ContactSettings />;
      case "theme":
        return <ThemeSettingsPanel />;
      case "media":
        return <MediaLibrary />;
      case "ai":
        return <AIStudio />;
      case "testimonials":
        return <TestimonialsManager />;
      case "global":
        return <GlobalControl />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.07 0.003 240)" }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 md:hidden border-0"
          style={{ background: "oklch(0 0 0 / 0.6)", cursor: "default" }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{
          width: "220px",
          background: "oklch(0.09 0.005 240)",
          borderRight: "1px solid oklch(0.18 0.01 240)",
          minHeight: "100vh",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="p-5 border-b"
          style={{ borderColor: "oklch(0.18 0.01 240)" }}
        >
          <p
            className="text-base font-bold tracking-[0.15em] neon-text"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            RISHAV
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.45 0.02 240)" }}
          >
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`admin_nav.${item.id}_link`}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`admin-nav-link w-full text-left ${activeSection === item.id ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="p-3 border-t"
          style={{ borderColor: "oklch(0.18 0.01 240)" }}
        >
          <a
            href="/"
            className="admin-nav-link block mb-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-sm">↗</span> View Site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-link w-full text-left"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 px-6 h-14 flex items-center justify-between"
          style={{
            background: "oklch(0.08 0.004 240 / 0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(0.16 0.009 240)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: "oklch(0.55 0.02 240)" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={18} />
            </button>
            <span
              className="text-sm font-semibold capitalize"
              style={{ color: "oklch(0.7 0.02 240)" }}
            >
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "oklch(0.45 0.02 240)" }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>

        {/* Section content */}
        <div className="p-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
