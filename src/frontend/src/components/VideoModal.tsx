import { Calendar, Clock, Eye, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoEntry } from "../backend";
import { VideoType } from "../backend";

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

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

// ─── Neon Spinner ─────────────────────────────────────────────────────────────

const SPINNER_STYLE_ID = "video-modal-spinner-keyframes";

function ensureSpinnerKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPINNER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SPINNER_STYLE_ID;
  style.textContent =
    "@keyframes vm-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}

function NeonSpinner() {
  ensureSpinnerKeyframes();
  return (
    <div
      aria-label="Loading video"
      role="status"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "3px solid transparent",
        borderTopColor: "var(--neon, oklch(0.82 0.22 193))",
        animation: "vm-spin 0.8s linear infinite",
        flexShrink: 0,
      }}
    />
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
    setLoadError(false);
    setIsLoading(true);
    el.load();
    el.play().catch(() => {
      // Autoplay blocked — controls let user manually start
    });
  }, [video.videoUrl]);

  if (!video.videoUrl) {
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
        <p style={{ color: "oklch(0.55 0.02 240)", fontSize: "14px" }}>
          No video file uploaded yet.
        </p>
        <p style={{ color: "oklch(0.4 0.02 240)", fontSize: "12px" }}>
          Go to the admin panel to upload a video file for this entry.
        </p>
      </div>
    );
  }

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
        <p style={{ color: "oklch(0.55 0.02 240)", fontSize: "14px" }}>
          Unable to load this video.
        </p>
        <p style={{ color: "oklch(0.45 0.02 240)", fontSize: "12px" }}>
          The video file may not be accessible. Try re-uploading it from the
          admin panel.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div
          className="thumb-skeleton"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "8px",
            zIndex: 1,
          }}
        >
          <NeonSpinner />
        </div>
      )}

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
          objectFit: "contain",
          background: "transparent",
          borderRadius: "8px",
          maxWidth: "100%",
        }}
      >
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

  const durationSec = Number(video.duration);

  // ── Aspect-ratio container ────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = isShortForm
    ? {
        aspectRatio: "9/16",
        maxHeight: "calc(100vh - 80px)",
        maxWidth: "min(90vw, calc((100vh - 80px) * 9 / 16))",
        width: "100%",
        position: "relative",
      }
    : {
        aspectRatio: "16/9",
        width: "min(90vw, calc((100vh - 80px) * 16 / 9))",
        maxWidth: "900px",
        position: "relative",
      };

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          ref={backdropRef}
          data-ocid="video.modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.92)",
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

            {/* ── Video player wrapper ── */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                background: "transparent",
                borderRadius: "8px",
              }}
            >
              <DirectVideoPlayer
                video={video}
                posterUrl={video.thumbnailUrl || undefined}
              />
            </div>

            {/* ── Info overlay (auto-hides after 3.5s) ── */}
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
                    {/* Duration badge */}
                    {durationSec > 0 && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "oklch(0 0 0 / 0.6)",
                          border: "1px solid oklch(0.35 0.02 240 / 0.5)",
                          color: "oklch(0.88 0.01 240)",
                        }}
                      >
                        <Clock size={9} />
                        {formatDuration(durationSec)}
                      </span>
                    )}
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
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
