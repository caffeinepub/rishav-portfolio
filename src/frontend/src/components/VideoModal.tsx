import { Calendar, Eye, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoEntry } from "../backend";
import { VideoPlatform, VideoType } from "../backend";

interface VideoModalProps {
  video: VideoEntry | null;
  onClose: () => void;
}

function formatViews(v: number | bigint): string {
  const num = Number(v);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatDate(ts: number | bigint): string {
  const ms =
    typeof ts === "bigint" ? Number(ts / BigInt(1_000_000)) : Number(ts);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Unified URL helpers ────────────────────────────────────────────────────────

/**
 * Extract YouTube video ID from ANY YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Build a clean YouTube embed URL.
 *
 * KEY RULES (root causes of black screen):
 * 1. MUST use https://www.youtube.com/embed/VIDEO_ID — NOT watch?v= or youtu.be/
 * 2. autoplay=1 requires mute=1 — browsers block autoplay with sound
 * 3. origin= prevents X-Frame-Options / CSP issues
 * 4. playsinline=1 — iOS Safari requires this to play inside page (not fullscreen)
 * 5. enablejsapi=1 — needed for YouTube player API to initialize
 */
function buildYouTubeEmbedUrl(videoId: string): string {
  const origin =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.origin)
      : "https://rishav.portfolio";
  return (
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}&fs=1`
  );
}

/** Build YouTube thumbnail URL — hqdefault is always available. */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Extract Instagram post/reel ID from URL */
function getInstagramPostId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/(?:p|reel)\/([^/?#\s]+)/);
  return m ? m[1] : null;
}

// ── Declare global instgrm for TypeScript ─────────────────────────────────────

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

// ─── Instagram Embed Component ────────────────────────────────────────────────
// Uses the official Instagram blockquote + embed.js approach.
// Direct /reel/{id}/embed/ iframes reliably show black screens — do NOT use them.

function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postId = getInstagramPostId(url);
  const permalink = postId ? `https://www.instagram.com/p/${postId}/` : url;

  // biome-ignore lint/correctness/useExhaustiveDependencies: url change must re-run
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const processEmbeds = () => {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    };

    const existing = document.getElementById("instagram-embed-script");
    if (existing) {
      // Script already loaded — give DOM time to mount the blockquote, then process
      timer = setTimeout(processEmbeds, 300);
      return () => clearTimeout(timer);
    }

    // Inject embed.js once — it will auto-process on load
    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Give the blockquote DOM node time to mount before processing
      timer = setTimeout(processEmbeds, 300);
    };
    document.body.appendChild(script);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        // No overflow:hidden — clips the embed and causes black screen
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        data-instgrm-captioned
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: "0",
          width: "calc(100% - 2px)",
        }}
      />
    </div>
  );
}

// ─── YouTube Iframe Component ─────────────────────────────────────────────────
// Separate component so we can properly handle the loading state and GPU fix.

function YouTubePlayer({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = buildYouTubeEmbedUrl(videoId);
  const posterUrl = getYouTubeThumbnail(videoId);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Show YouTube thumbnail as poster while iframe loads */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${posterUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 1,
            borderRadius: "8px",
          }}
        >
          <div
            className="thumb-skeleton"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "8px",
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {/*
        CRITICAL FIXES for YouTube black screen:
        1. src uses /embed/VIDEO_ID format (never watch?v=)
        2. autoplay=1 + mute=1 (mute is REQUIRED for autoplay)
        3. allow="autoplay" is required in addition to the URL parameter
        4. allowFullScreen — enables native fullscreen button
        5. No sandbox attribute — it blocks YouTube scripts and causes black screen
        6. background: transparent on iframe — prevents black flash
        7. GPU compositing: transform: translateZ(0) + will-change: transform
      */}
      <iframe
        key={videoId}
        title={title}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          background: "transparent",
          borderRadius: "8px",
          // GPU compositing fix — forces video onto its own compositor layer
          // Prevents black screen caused by software rendering fallback
          transform: "translateZ(0)",
          willChange: "transform",
          // Prevent zoom on mobile tap
          touchAction: "none",
        }}
      />
    </div>
  );
}

// ─── Direct Video Player Component ────────────────────────────────────────────

function DirectVideoPlayer({
  video,
  posterUrl,
}: {
  video: VideoEntry;
  posterUrl?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: videoUrl change → re-trigger play
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Reset error state when URL changes
    setLoadError(false);
    setIsLoading(true);
    el.load(); // Force reload when src changes
    el.play().catch(() => {
      // Autoplay blocked — fine, controls let user manually start
    });
  }, [video.videoUrl]);

  if (loadError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.08 0.004 240)",
          gap: "12px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "oklch(0.55 0.02 240)",
            fontSize: "14px",
          }}
        >
          Unable to load this video. Direct MP4 links must be publicly
          accessible (no CORS restrictions).
        </p>
        <p
          style={{
            color: "oklch(0.45 0.02 240)",
            fontSize: "12px",
          }}
        >
          Tip: Use a YouTube or Instagram link instead, or host the file via
          Cloudinary / Firebase Storage with public access enabled.
        </p>
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--neon)",
            fontSize: "13px",
            textDecoration: "underline",
          }}
        >
          Try opening in new tab
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="thumb-skeleton"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "8px",
            zIndex: 1,
          }}
        />
      )}

      {/*
        CRITICAL FIXES for direct MP4 black screen:
        1. controls — user can start/pause/seek (autoplay is unreliable)
        2. preload="metadata" — loads enough to show first frame (prevents black preview)
        3. playsInline — iOS Safari REQUIRES this to play inline (without it, goes fullscreen and breaks layout)
        4. muted — required for autoplay in ALL modern browsers
        5. autoPlay — attempt silent autoplay; if blocked, controls let user start
        6. poster — shows thumbnail instead of black frame before play starts
        7. transform: translateZ(0) — GPU compositing fix for black screen
        8. will-change: transform — tells browser to create compositor layer
        9. object-fit: contain — no zoom/crop; letterbox is better than cropped black
        10. NO overflow:hidden on parent — clips video and causes black screen
        11. NO transform:scale() — causes zoom issue on click
      */}
      <video
        ref={videoRef}
        key={video.videoUrl}
        controls
        preload="metadata"
        playsInline
        muted
        autoPlay
        loop
        poster={posterUrl || video.thumbnailUrl || undefined}
        onLoadedData={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setLoadError(true);
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          // object-fit: contain prevents zoom/crop — black bars > zoom
          objectFit: "contain",
          background: "transparent",
          borderRadius: "8px",
          maxWidth: "100%",
          // GPU compositing fix — forces video onto its own compositor layer
          // This is the #1 fix for "audio plays but video is black"
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        {/*
          Only ONE <source> per MIME type.
          Listing the same URL twice confuses servers — remove the duplicate.
          The browser picks the first format it can decode.
        */}
        <source src={video.videoUrl} type="video/mp4" />
        <source src={video.videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function VideoModal({ video, onClose }: VideoModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(true);
  const infoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isShortForm = video?.videoType === VideoType.short_;

  const resetInfoTimer = useCallback(() => {
    setShowInfo(true);
    if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
    infoTimerRef.current = setTimeout(() => setShowInfo(false), 3500);
  }, []);

  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    resetInfoTimer();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
    };
  }, [video, onClose, resetInfoTimer]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!video) return null;

  // ── Platform detection ────────────────────────────────────────────────────
  // Instagram platform tag takes priority — never treat it as YouTube
  const igPostId = getInstagramPostId(video.videoUrl);
  const isInstagram =
    video.platform === VideoPlatform.instagram ||
    (!!igPostId && video.platform !== VideoPlatform.youtube);

  // Extract YouTube ID for embed
  const ytId = !isInstagram ? getYouTubeId(video.videoUrl) : null;
  const isYouTube = !isInstagram && !!ytId;

  // Auto-generate poster from YouTube when no manual thumbnail
  const autoPoster =
    !video.thumbnailUrl && isYouTube && ytId
      ? getYouTubeThumbnail(ytId)
      : video.thumbnailUrl || undefined;

  // ── Aspect-ratio container ────────────────────────────────────────────────
  // Short-form (reels/shorts): 9:16  |  Long-form: 16:9  |  Instagram: auto
  //
  // ZOOM FIX: Never use transform:scale on the container.
  // Use explicit maxWidth + maxHeight constraints instead of scale transforms.
  const containerStyle: React.CSSProperties = isInstagram
    ? {
        width: "min(90vw, 540px)",
        maxHeight: "calc(100vh - 80px)",
        // Allow natural scroll for Instagram embed
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }
    : isShortForm
      ? {
          // 9:16 portrait — constrained to viewport height
          aspectRatio: "9/16",
          maxHeight: "calc(100vh - 80px)",
          // Width derived from height to preserve exact 9:16 ratio
          maxWidth: "min(90vw, calc((100vh - 80px) * 9 / 16))",
          width: "100%",
          position: "relative",
        }
      : {
          // 16:9 landscape — standard widescreen
          aspectRatio: "16/9",
          width: "min(90vw, calc((100vh - 80px) * 16 / 9))",
          maxWidth: "900px",
          position: "relative",
        };

  // ── Render correct player ─────────────────────────────────────────────────
  function renderPlayer() {
    if (isInstagram) {
      return <InstagramEmbed url={video!.videoUrl} />;
    }

    if (isYouTube && ytId) {
      return <YouTubePlayer videoId={ytId} title={video!.title} />;
    }

    // Uploaded / direct link (MP4, WebM, etc.)
    return <DirectVideoPlayer video={video!} posterUrl={autoPoster} />;
  }

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          ref={backdropRef}
          data-ocid="video.modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.92)",
            // Prevent pinch-zoom on the backdrop from zooming the video
            touchAction: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          onMouseMove={resetInfoTimer}
        >
          {/* ── Modal content box ── */}
          <motion.div
            style={containerStyle}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Close button ── */}
            <button
              type="button"
              data-ocid="video.close_button"
              onClick={onClose}
              aria-label="Close video"
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                zIndex: 10,
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "30px",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={26} />
            </button>

            {/* ── Video player wrapper ─────────────────────────────────────────
              CRITICAL: Do NOT add overflow:hidden here.
              overflow:hidden on the parent:
                - Clips the Instagram embed → shows black/empty area
                - Clips video controls on some mobile browsers
                - Prevents YouTube iframe from initializing properly on iOS
            ────────────────────────────────────────────────────────────────── */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: isInstagram ? "auto" : "100%",
                background: "transparent",
                borderRadius: "8px",
                // NO overflow:hidden — see comment above
              }}
            >
              {renderPlayer()}
            </div>

            {/* ── Info overlay (auto-hides after 3.5s) ── */}
            {!isInstagram && (
              <motion.div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px 20px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                  borderRadius: "0 0 8px 8px",
                  pointerEvents: "none",
                }}
                animate={{ opacity: showInfo ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {video.featured && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 10px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "oklch(0.82 0.22 193 / 0.18)",
                            border: "1px solid oklch(0.82 0.22 193 / 0.45)",
                            color: "oklch(0.82 0.22 193)",
                          }}
                        >
                          <Star size={9} fill="currentColor" />
                          Featured
                        </span>
                      )}
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          background: "oklch(0.75 0.16 280 / 0.15)",
                          border: "1px solid oklch(0.75 0.16 280 / 0.3)",
                          color: "oklch(0.82 0.16 280)",
                        }}
                      >
                        {video.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: 1.35,
                        marginBottom: "4px",
                        color: "oklch(0.97 0.01 240)",
                        textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                        fontFamily: '"Bricolage Grotesque", sans-serif',
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {video.title}
                    </h2>

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: "11px",
                        color: "oklch(0.65 0.02 240)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Eye size={12} />
                        {formatViews(video.views)} views
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Calendar size={12} />
                        {formatDate(video.uploadDate)}
                      </span>
                      <span
                        style={{
                          textTransform: "capitalize",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: "oklch(0.14 0.008 240 / 0.8)",
                        }}
                      >
                        {video.platform}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
