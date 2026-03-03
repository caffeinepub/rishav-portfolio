import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Eye,
  Menu,
  Play,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiDavinciresolve,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
  SiYoutube,
} from "react-icons/si";
import type {
  Category,
  SectionConfig,
  Service,
  SiteContent,
  Testimonial,
  VideoEntry,
} from "../backend";
import { VideoType } from "../backend";
import { VideoModal } from "../components/VideoModal";
import {
  useAllCategories,
  useAllServices,
  useAllTestimonials,
  useAllVideos,
  useSectionConfig,
  useSiteContent,
} from "../hooks/useQueries";

// ─── Helper utils ─────────────────────────────────────────────────────────────

function formatViews(v: number | bigint): string {
  const num = Number(v);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatDate(ts: number | bigint): string {
  // ts may be a plain millisecond timestamp (number) or a nanosecond bigint
  const ms =
    typeof ts === "bigint" ? Number(ts / BigInt(1_000_000)) : Number(ts);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Gradient placeholder for missing thumbnails
const GRADIENT_PLACEHOLDERS = [
  "linear-gradient(135deg, oklch(0.25 0.08 220), oklch(0.15 0.12 280))",
  "linear-gradient(135deg, oklch(0.2 0.1 180), oklch(0.15 0.08 240))",
  "linear-gradient(135deg, oklch(0.25 0.09 300), oklch(0.15 0.1 260))",
  "linear-gradient(135deg, oklch(0.22 0.08 160), oklch(0.15 0.09 200))",
  "linear-gradient(135deg, oklch(0.25 0.07 350), oklch(0.18 0.1 300))",
  "linear-gradient(135deg, oklch(0.2 0.1 60), oklch(0.15 0.08 20))",
];

/** Return the manual thumbnail if available, otherwise empty string */
function getAutoThumbnail(_videoUrl: string, manualThumb: string): string {
  if (manualThumb?.trim()) return manualThumb;
  return "";
}

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function getThumbnailStyle(url: string, index: number): React.CSSProperties {
  if (url?.trim()) {
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background: GRADIENT_PLACEHOLDERS[index % GRADIENT_PLACEHOLDERS.length],
  };
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

const ADMIN_URL = "/admin";
const HOLD_DURATION = 5000;

function HeroSection({ siteContent }: { siteContent: SiteContent }) {
  const letters = (siteContent.heroName || "RISHAV").split("");
  const whatsappUrl = `https://wa.me/${siteContent.whatsappNumber}`;

  // ── Admin hold-trigger state ──────────────────────────────────────────────
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [holdProgress, setHoldProgress] = useState(0); // 0–100
  const isHoldingRef = useRef(false);

  const startHold = () => {
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    setHoldProgress(0);
    const start = Date.now();

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(pct);
    }, 30);

    holdTimerRef.current = setTimeout(() => {
      clearInterval(holdIntervalRef.current!);
      setHoldProgress(100);
      window.location.href = ADMIN_URL;
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    clearTimeout(holdTimerRef.current!);
    clearInterval(holdIntervalRef.current!);
    holdTimerRef.current = null;
    holdIntervalRef.current = null;
    setHoldProgress(0);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current!);
      clearInterval(holdIntervalRef.current!);
    };
  }, []);

  const scrollToPortfolio = () => {
    document
      .getElementById("shortform-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // SVG ring helpers
  const RING_R = 22;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = RING_CIRC - (holdProgress / 100) * RING_CIRC;

  return (
    <section
      data-ocid="hero.section"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Hero background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/assets/generated/hero-bg.dim_1920x1080.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      {/* Animated mesh background */}
      <div className="hero-mesh-bg" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.82 0.22 193) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.22 193) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm font-semibold tracking-[0.3em] uppercase mb-4"
          style={{ color: "var(--neon)" }}
        >
          {siteContent.heroHeading}
        </motion.p>

        {/* Giant name */}
        <div className="flex justify-center gap-1 mb-6 overflow-visible">
          {letters.map((letter, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: animated letter reveal needs positional key
              key={`letter-${i}`}
              initial={{ opacity: 0, y: 60, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.4 + i * 0.08,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="neon-gradient-text section-heading"
              style={{
                fontSize: "clamp(4rem, 12vw, 9rem)",
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                display: "inline-block",
                lineHeight: 1,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-lg md:text-xl mb-5 max-w-xl mx-auto"
          style={{ color: "oklch(0.65 0.02 240)", lineHeight: 1.6 }}
        >
          {siteContent.heroTagline}
        </motion.p>

        {/* Tech Icons Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.501 }}
          className="flex items-center justify-center gap-2 mb-10 flex-wrap"
        >
          {[
            {
              Icon: SiAdobepremierepro,
              label: "Premiere Pro",
              color: "oklch(0.65 0.18 280)",
            },
            { Icon: SiAdobeaftereffects, color: "oklch(0.62 0.15 260)" },
            { Icon: SiDavinciresolve, color: "oklch(0.68 0.12 220)" },
            { Icon: SiYoutube, color: "oklch(0.6 0.22 25)" },
            { Icon: SiInstagram, color: "oklch(0.68 0.18 340)" },
            { Icon: SiTiktok, color: "oklch(0.72 0.08 195)" },
          ].map(({ Icon, label, color }, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: static list of tech icons
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 1.501 + i * 0.07,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              title={label}
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: "oklch(0.12 0.006 240 / 0.7)",
                border: "1px solid oklch(0.35 0.04 240 / 0.5)",
                backdropFilter: "blur(8px)",
                boxShadow: `0 0 10px ${color}22`,
                color,
              }}
            >
              <Icon size={18} />
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* View Portfolio — normal click scrolls, 5s hold opens /admin */}
          <div className="relative inline-flex items-center justify-center select-none">
            {/* SVG progress ring (only visible while holding) */}
            {holdProgress > 0 && (
              <svg
                width={54}
                height={54}
                viewBox="0 0 54 54"
                className="absolute pointer-events-none"
                style={{ zIndex: 20 }}
                role="img"
                aria-label="Admin access progress"
              >
                <circle
                  cx={27}
                  cy={27}
                  r={RING_R}
                  fill="none"
                  stroke="var(--neon)"
                  strokeWidth={2.5}
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "27px 27px",
                    filter: "drop-shadow(0 0 6px var(--neon))",
                    transition: "stroke-dashoffset 0.03s linear",
                  }}
                />
              </svg>
            )}
            <button
              id="view-portfolio-btn"
              type="button"
              data-ocid="hero.portfolio_button"
              onClick={scrollToPortfolio}
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={(e) => {
                e.preventDefault();
                startHold();
              }}
              onTouchEnd={cancelHold}
              onTouchCancel={cancelHold}
              className="btn-neon px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide"
              style={
                holdProgress > 0
                  ? { boxShadow: `0 0 ${8 + holdProgress * 0.3}px var(--neon)` }
                  : undefined
              }
            >
              <span>View Portfolio</span>
            </button>
          </div>

          <a
            data-ocid="hero.whatsapp_button"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300"
            style={{
              background: "oklch(0.55 0.2 145 / 0.15)",
              border: "1px solid oklch(0.55 0.2 145 / 0.5)",
              color: "oklch(0.72 0.2 145)",
            }}
          >
            <SiWhatsapp size={16} />
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Scroll hint — pinned to very bottom of hero section */}
      <motion.button
        onClick={scrollToPortfolio}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ color: "oklch(0.45 0.02 240)" }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ArrowDown size={14} />
        </motion.div>
      </motion.button>

      {/* Decorative orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.22 193 / 0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.16 280 / 0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </section>
  );
}

// ─── VIDEO CARD — SHORT FORM ──────────────────────────────────────────────────

function ShortVideoCard({
  video,
  index,
  onClick,
}: {
  video: VideoEntry;
  index: number;
  onClick: () => void;
}) {
  const thumbUrl = getAutoThumbnail(video.videoUrl, video.thumbnailUrl);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const resolvedThumb = thumbError ? "" : thumbUrl;

  return (
    <motion.div
      data-ocid={`shortform.item.${index + 1}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
      onClick={onClick}
      className="glass-card glass-card-hover rounded-xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "9/16" }}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full h-full"
        style={getThumbnailStyle(resolvedThumb, index)}
      >
        {/* Hidden img tag for lazy loading & error detection */}
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            onLoad={() => setThumbLoaded(true)}
            onError={() => setThumbError(true)}
            style={{ display: "none" }}
          />
        )}
        {(!resolvedThumb || !thumbLoaded) && (
          <div className="absolute inset-0 thumb-skeleton" />
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "oklch(0 0 0 / 0.4)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.22 193 / 0.2)",
              border: "2px solid var(--neon)",
              boxShadow: "var(--neon-glow)",
            }}
          >
            <Play
              size={20}
              fill="currentColor"
              style={{ color: "var(--neon)", marginLeft: "2px" }}
            />
          </div>
        </div>

        {/* Duration badge — bottom-right, overlapping thumbnail */}
        {Number(video.duration) > 0 && (
          <div
            className="absolute bottom-14 right-2 z-10"
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 700,
              background: "oklch(0 0 0 / 0.75)",
              color: "oklch(0.95 0.01 240)",
              letterSpacing: "0.02em",
            }}
          >
            {formatDuration(Number(video.duration))}
          </div>
        )}

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 gradient-overlay-bottom">
          <p
            className="text-xs font-semibold leading-tight line-clamp-2 mb-2"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            {video.title}
          </p>
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: "oklch(0.65 0.02 240)" }}
          >
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {formatViews(video.views)}
            </span>
            <span>{formatDate(video.uploadDate)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── VIDEO CARD — LONG FORM ───────────────────────────────────────────────────

function LongVideoCard({
  video,
  index,
  onClick,
}: {
  video: VideoEntry;
  index: number;
  onClick: () => void;
}) {
  const thumbUrl = getAutoThumbnail(video.videoUrl, video.thumbnailUrl);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const resolvedThumb = thumbError ? "" : thumbUrl;

  return (
    <motion.div
      data-ocid={`longform.item.${index + 1}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      onClick={onClick}
      className="glass-card glass-card-hover rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Thumbnail */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "16/9",
          ...getThumbnailStyle(resolvedThumb, index + 10),
        }}
      >
        {/* Hidden img for lazy load + error detection */}
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            onLoad={() => setThumbLoaded(true)}
            onError={() => setThumbError(true)}
            style={{ display: "none" }}
          />
        )}
        {(!resolvedThumb || !thumbLoaded) && (
          <div className="absolute inset-0 thumb-skeleton" />
        )}

        {/* Featured badge */}
        {video.featured && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold neon-pulse"
            style={{
              background: "oklch(0.82 0.22 193 / 0.2)",
              border: "1px solid oklch(0.82 0.22 193 / 0.5)",
              color: "var(--neon)",
            }}
          >
            <Star size={10} fill="currentColor" />
            Featured
          </div>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "oklch(0 0 0 / 0.5)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.22 193 / 0.2)",
              border: "2px solid var(--neon)",
              boxShadow: "var(--neon-glow)",
            }}
          >
            <Play
              size={24}
              fill="currentColor"
              style={{ color: "var(--neon)", marginLeft: "3px" }}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 gradient-overlay-bottom" />

        {/* Duration badge — bottom-right of thumbnail */}
        {Number(video.duration) > 0 && (
          <div
            className="absolute bottom-2 right-2 z-10"
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 700,
              background: "oklch(0 0 0 / 0.75)",
              color: "oklch(0.95 0.01 240)",
              letterSpacing: "0.02em",
            }}
          >
            {formatDuration(Number(video.duration))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-semibold text-sm leading-snug line-clamp-2 mb-2"
          style={{
            color: "oklch(0.92 0.01 240)",
            fontFamily: '"Bricolage Grotesque", sans-serif',
          }}
        >
          {video.title}
        </h3>
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: "oklch(0.5 0.02 240)" }}
        >
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {formatViews(video.views)} views
          </span>
          <span>{formatDate(video.uploadDate)}</span>
        </div>
        <p
          className="text-xs mt-1.5 font-medium"
          style={{ color: "var(--neon)" }}
        >
          Rishav
        </p>
      </div>
    </motion.div>
  );
}

// ─── FEATURED CARD ───────────────────────────────────────────────────────────

function FeaturedCard({
  v,
  i,
  activeIdx,
  onVideoClick,
  setActiveIdx,
}: {
  v: VideoEntry;
  i: number;
  activeIdx: number;
  onVideoClick: (v: VideoEntry) => void;
  setActiveIdx: (i: number) => void;
}) {
  const thumbUrl = getAutoThumbnail(v.videoUrl, v.thumbnailUrl);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const resolvedThumb = thumbError ? "" : thumbUrl;

  return (
    <motion.div
      data-ocid={`featured.item.${i + 1}`}
      className="flex-shrink-0 scroll-snap-item cursor-pointer"
      style={{ width: "clamp(280px, 35vw, 400px)" }}
      onClick={() => {
        setActiveIdx(i);
        onVideoClick(v);
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          aspectRatio: "16/9",
          ...getThumbnailStyle(resolvedThumb, i + 20),
          border:
            i === activeIdx
              ? "2px solid var(--neon)"
              : "2px solid oklch(0.22 0.015 240)",
          boxShadow: i === activeIdx ? "var(--neon-glow)" : "none",
        }}
      >
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            onLoad={() => setThumbLoaded(true)}
            onError={() => setThumbError(true)}
            style={{ display: "none" }}
          />
        )}
        {(!resolvedThumb || !thumbLoaded) && (
          <div className="thumb-skeleton absolute inset-0" />
        )}
        <div className="absolute inset-0 gradient-overlay-bottom" />
        <div className="absolute bottom-4 left-4 right-4">
          <p
            className="text-sm font-bold line-clamp-2"
            style={{
              color: "oklch(0.95 0.01 240)",
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            {v.title}
          </p>
          <p
            className="text-xs mt-1 flex items-center gap-1"
            style={{ color: "oklch(0.65 0.02 240)" }}
          >
            <Eye size={10} />
            {formatViews(v.views)} views
          </p>
        </div>
        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.06 0 0 / 0.7)",
            border: "1px solid oklch(0.82 0.22 193 / 0.4)",
          }}
        >
          <Play
            size={12}
            fill="currentColor"
            style={{ color: "var(--neon)", marginLeft: "2px" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── FEATURED SLIDER ──────────────────────────────────────────────────────────

function FeaturedSlider({
  videos,
  onVideoClick,
}: {
  videos: VideoEntry[];
  onVideoClick: (v: VideoEntry) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (videos.length === 0) return null;

  return (
    <section data-ocid="featured.section" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            Highlights
          </p>
          <h2
            className="section-heading"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Featured Work
          </h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto scroll-snap-x pb-4 no-scrollbar">
          {videos.map((v, i) => (
            <FeaturedCard
              key={v.id}
              v={v}
              i={i}
              activeIdx={activeIdx}
              onVideoClick={onVideoClick}
              setActiveIdx={setActiveIdx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES SECTION ─────────────────────────────────────────────────────────

function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section data-ocid="services.section" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            What I Do
          </p>
          <h2
            className="section-heading"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              data-ocid={`services.item.${i + 1}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card glass-card-hover rounded-2xl p-6 float-anim group"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <div
                className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: "oklch(0.82 0.22 193 / 0.08)",
                  border: "1px solid oklch(0.82 0.22 193 / 0.2)",
                }}
              >
                {svc.icon}
              </div>
              <h3
                className="font-bold text-base mb-2"
                style={{
                  color: "oklch(0.92 0.01 240)",
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                }}
              >
                {svc.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                {svc.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────

function AboutSection({ siteContent }: { siteContent: SiteContent }) {
  const stats = [
    {
      value: siteContent.aboutStat1Value || "5+",
      label: siteContent.aboutStat1Label || "Years Experience",
    },
    {
      value: siteContent.aboutStat2Value || "200+",
      label: siteContent.aboutStat2Label || "Projects Done",
    },
    {
      value: siteContent.aboutStat3Value || "50M+",
      label: siteContent.aboutStat3Label || "Views Generated",
    },
  ];

  return (
    <section data-ocid="about.section" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p
                className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
                style={{ color: "var(--neon)" }}
              >
                The Creator
              </p>
              <h2
                className="section-heading mb-6"
                style={{ color: "oklch(0.95 0.01 240)" }}
              >
                About Me
              </h2>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "oklch(0.65 0.02 240)" }}
              >
                {siteContent.aboutText}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.5 0.02 240)" }}
              >
                {siteContent.aboutSubtext}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mt-10"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="text-2xl font-bold mb-1 neon-text"
                    style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.02 240)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div
              className="relative rounded-3xl overflow-hidden float-anim"
              style={{
                aspectRatio: "4/5",
                border: "1px solid oklch(0.82 0.22 193 / 0.2)",
                background: "oklch(0.1 0.005 240)",
              }}
            >
              <img
                src={
                  siteContent.profileImageUrl ||
                  "/assets/generated/about-portrait.dim_600x750.jpg"
                }
                alt={`${siteContent.heroName} — Professional Video Editor`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.06 0 0 / 0.7) 0%, transparent 45%)",
                }}
              />
              <div className="absolute bottom-6 left-6">
                <p
                  className="text-xl font-bold neon-text"
                  style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
                >
                  {siteContent.heroName}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.65 0.02 240)" }}
                >
                  Professional Video Editor
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-4 -left-4 glass-card px-4 py-3 rounded-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: "oklch(0.65 0.02 240)" }}
              >
                Available for Work
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "oklch(0.7 0.22 145)",
                    boxShadow: "0 0 6px oklch(0.7 0.22 145)",
                  }}
                />
                <p
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.72 0.2 145)" }}
                >
                  Open to Projects
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS SECTION ─────────────────────────────────────────────────────

function TestimonialsSection({
  testimonials,
}: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section data-ocid="testimonials.section" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            Testimonials
          </p>
          <h2
            className="section-heading"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Client Reviews
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const rating = Number(t.rating);
            const initials = t.clientName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <motion.div
                key={t.id}
                data-ocid={`testimonials.item.${i + 1}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      fill={n <= rating ? "currentColor" : "none"}
                      style={{
                        color:
                          n <= rating ? "var(--neon)" : "oklch(0.3 0.01 240)",
                        filter:
                          n <= rating
                            ? "drop-shadow(0 0 3px var(--neon))"
                            : "none",
                      }}
                    />
                  ))}
                </div>

                {/* Review */}
                <p
                  className="text-sm leading-relaxed italic line-clamp-3 flex-1"
                  style={{ color: "oklch(0.65 0.02 240)" }}
                >
                  "{t.review}"
                </p>

                {/* Client */}
                <div className="flex items-center gap-3">
                  {t.clientImageUrl ? (
                    <img
                      src={t.clientImageUrl}
                      alt={t.clientName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      style={{
                        border: "1px solid oklch(0.82 0.22 193 / 0.3)",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "oklch(0.82 0.22 193 / 0.15)",
                        border: "1px solid oklch(0.82 0.22 193 / 0.3)",
                        color: "var(--neon)",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "oklch(0.88 0.01 240)",
                      fontFamily: '"Bricolage Grotesque", sans-serif',
                    }}
                  >
                    {t.clientName}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────

function ContactSection({ siteContent }: { siteContent: SiteContent }) {
  const whatsappUrl = `https://wa.me/${siteContent.whatsappNumber}?text=${encodeURIComponent(siteContent.whatsappMessage || "Hi Rishav!")}`;

  return (
    <section data-ocid="contact.section" className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            Get In Touch
          </p>
          <h2
            className="section-heading mb-4"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Let's Work Together
          </h2>
          <p
            className="text-base mb-10"
            style={{ color: "oklch(0.55 0.02 240)" }}
          >
            Ready to elevate your content? Let's connect and create something
            extraordinary.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-base font-semibold transition-all duration-300"
            style={{
              background: "oklch(0.55 0.2 145 / 0.15)",
              border: "1px solid oklch(0.55 0.2 145 / 0.5)",
              color: "oklch(0.72 0.2 145)",
              boxShadow: "0 0 30px oklch(0.55 0.2 145 / 0.1)",
            }}
          >
            <SiWhatsapp size={22} />
            Chat on WhatsApp
            <ChevronRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="py-8 px-6 border-t"
      style={{ borderColor: "oklch(0.18 0.012 240)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p
          className="text-sm font-display font-bold neon-text"
          style={{ letterSpacing: "0.15em" }}
        >
          RISHAV
        </p>
        <p
          className="text-xs text-center"
          style={{ color: "oklch(0.4 0.01 240)" }}
        >
          © {year}. Built with ❤️ using{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--neon)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// ─── FLOATING BUTTONS ────────────────────────────────────────────────────────

function FloatingButtons({
  whatsappUrl,
}: {
  whatsappUrl: string;
}) {
  return (
    <>
      {/* WhatsApp */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center glass-card"
        style={{
          border: "1px solid oklch(0.55 0.2 145 / 0.5)",
          color: "oklch(0.72 0.2 145)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <SiWhatsapp size={22} />
      </motion.a>
    </>
  );
}

// ─── SHORT FORM SECTION ───────────────────────────────────────────────────────

function ShortFormSection({
  videos,
  categories,
  onVideoClick,
}: {
  videos: VideoEntry[];
  categories: Category[];
  onVideoClick: (v: VideoEntry) => void;
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredVideos = videos.filter((v) => {
    if (v.videoType !== VideoType.short_) return false;
    if (activeFilter === "all") return true;
    return v.category === activeFilter;
  });

  return (
    <section
      data-ocid="shortform.section"
      id="shortform-section"
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            Vertical Content
          </p>
          <h2
            className="section-heading"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Short Form Content
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
          {["all", ...categories.map((c) => c.slug)].map((filter) => {
            const label =
              filter === "all"
                ? "All"
                : (categories.find((c) => c.slug === filter)?.name ?? filter);
            return (
              <button
                type="button"
                key={filter}
                data-ocid="shortform.filter.tab"
                onClick={() => setActiveFilter(filter)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  background:
                    activeFilter === filter
                      ? "oklch(0.82 0.22 193 / 0.15)"
                      : "oklch(0.12 0.006 240)",
                  border:
                    activeFilter === filter
                      ? "1px solid oklch(0.82 0.22 193 / 0.5)"
                      : "1px solid oklch(0.22 0.012 240)",
                  color:
                    activeFilter === filter
                      ? "var(--neon)"
                      : "oklch(0.55 0.02 240)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map((v, i) => (
              <ShortVideoCard
                key={v.id}
                video={v}
                index={i}
                onClick={() => onVideoClick(v)}
              />
            ))}
          </div>
        ) : (
          <div
            data-ocid="shortform.empty_state"
            className="text-center py-20"
            style={{ color: "oklch(0.45 0.02 240)" }}
          >
            <p className="text-sm">No videos in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── LONG FORM SECTION ───────────────────────────────────────────────────────

function LongFormSection({
  videos,
  onVideoClick,
}: {
  videos: VideoEntry[];
  onVideoClick: (v: VideoEntry) => void;
}) {
  const longVideos = videos.filter((v) => v.videoType === VideoType.long_);

  return (
    <section data-ocid="longform.section" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--neon)" }}
          >
            Full-Length
          </p>
          <h2
            className="section-heading"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Long Form Work
          </h2>
        </motion.div>

        {longVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {longVideos.map((v, i) => (
              <LongVideoCard
                key={v.id}
                video={v}
                index={i}
                onClick={() => onVideoClick(v)}
              />
            ))}
          </div>
        ) : (
          <div
            data-ocid="longform.empty_state"
            className="text-center py-20"
            style={{ color: "oklch(0.45 0.02 240)" }}
          >
            <p className="text-sm">No long-form videos yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SCROLL TO TOP ─────────────────────────────────────────────────────────────

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      type="button"
      aria-label="Scroll to top"
      className="scroll-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ArrowUp size={16} />
    </motion.button>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Work", id: "shortform-section" },
  { label: "Long Form", id: "longform-section" },
  { label: "Services", id: "services-section" },
  { label: "About", id: "about-section" },
  { label: "Contact", id: "contact-section" },
];

function Navbar({ siteContent }: { siteContent: SiteContent }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.id);
    const observers: IntersectionObserver[] = [];

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-40% 0px -55% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        data-ocid="nav.section"
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
        style={{
          background: scrolled ? "oklch(0.07 0.003 240 / 0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid oklch(0.82 0.22 193 / 0.1)"
            : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="text-lg font-bold tracking-[0.2em] neon-text"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            {siteContent.heroName}
          </span>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((item) => (
              <button
                type="button"
                key={item.label}
                data-ocid={`nav.${item.id}_link`}
                onClick={() => scrollTo(item.id)}
                className="text-sm transition-all duration-200 relative"
                style={{
                  color:
                    activeId === item.id
                      ? "var(--neon)"
                      : "oklch(0.55 0.02 240)",
                  textShadow:
                    activeId === item.id
                      ? "0 0 12px oklch(0.82 0.22 193 / 0.5)"
                      : "none",
                }}
              >
                {item.label}
                {activeId === item.id && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: "var(--neon)" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            data-ocid="nav.mobile_menu_button"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "oklch(0.65 0.02 240)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            data-ocid="nav.mobile_panel"
            className="mobile-nav-panel md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  data-ocid={`nav.mobile_${item.id}_link`}
                  onClick={() => scrollTo(item.id)}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                  style={{
                    color:
                      activeId === item.id
                        ? "var(--neon)"
                        : "oklch(0.65 0.02 240)",
                    background:
                      activeId === item.id
                        ? "oklch(0.82 0.22 193 / 0.08)"
                        : "transparent",
                    borderLeft:
                      activeId === item.id
                        ? "2px solid var(--neon)"
                        : "2px solid transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────

const DEFAULT_SECTION_CONFIG: SectionConfig = {
  heroEnabled: true,
  shortformEnabled: true,
  longformEnabled: true,
  featuredEnabled: true,
  servicesEnabled: true,
  aboutEnabled: true,
  contactEnabled: true,
  testimonialsEnabled: true,
};

export function PortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoEntry | null>(null);

  const { data: videos = [] } = useAllVideos();
  const { data: categories = [] } = useAllCategories();
  const { data: services = [] } = useAllServices();
  const { data: siteContent } = useSiteContent();
  const { data: testimonials = [] } = useAllTestimonials();
  const { data: sectionConfig } = useSectionConfig();

  const content: SiteContent = siteContent ?? {
    heroHeading: "Professional Video Editor",
    heroName: "RISHAV",
    heroTagline: "Crafting high-retention videos for creators & brands.",
    whatsappNumber: "9395889127",
    whatsappMessage: "Hi Rishav! I'd like to discuss a video project.",
    aboutText:
      "I'm Rishav, a passionate video editor with 5+ years of experience.",
    aboutSubtext:
      "From cinematic long-form documentaries to punchy short-form reels.",
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

  const sections = sectionConfig ?? DEFAULT_SECTION_CONFIG;

  // SEO meta tags injection
  useEffect(() => {
    if (content.seoTitle) document.title = content.seoTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (content.seoDescription)
      metaDesc.setAttribute("content", content.seoDescription);
    if (content.faviconUrl) {
      let favicon = document.querySelector(
        'link[rel="icon"]',
      ) as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = content.faviconUrl;
    }
  }, [content.seoTitle, content.seoDescription, content.faviconUrl]);

  const featuredVideos = videos.filter((v) => v.featured);
  const visibleServices = services.filter((s) => s.visible !== false);
  const whatsappUrl = `https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(content.whatsappMessage || "Hi!")}`;

  return (
    <div
      className="min-h-screen page-fade-in"
      style={{ background: "oklch(0.06 0 0)" }}
    >
      <Navbar siteContent={content} />

      <HeroSection siteContent={content} />

      {sections.shortformEnabled && (
        <ShortFormSection
          videos={videos}
          categories={categories}
          onVideoClick={setSelectedVideo}
        />
      )}

      {sections.longformEnabled && (
        <div id="longform-section">
          <LongFormSection videos={videos} onVideoClick={setSelectedVideo} />
        </div>
      )}

      {sections.featuredEnabled && featuredVideos.length > 0 && (
        <div id="featured-section">
          <FeaturedSlider
            videos={featuredVideos}
            onVideoClick={setSelectedVideo}
          />
        </div>
      )}

      {sections.servicesEnabled && (
        <div id="services-section">
          <ServicesSection services={visibleServices} />
        </div>
      )}

      {sections.aboutEnabled && (
        <div id="about-section">
          <AboutSection siteContent={content} />
        </div>
      )}

      {sections.testimonialsEnabled && testimonials.length > 0 && (
        <div id="testimonials-section">
          <TestimonialsSection testimonials={testimonials} />
        </div>
      )}

      {sections.contactEnabled && (
        <div id="contact-section">
          <ContactSection siteContent={content} />
        </div>
      )}

      <Footer />

      {/* Floating action buttons */}
      <FloatingButtons whatsappUrl={whatsappUrl} />

      {/* Scroll to top */}
      <AnimatePresence>
        <ScrollToTopButton />
      </AnimatePresence>

      {/* Modals */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
