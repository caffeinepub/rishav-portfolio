import { Calendar, Eye, Maximize2, Minimize2, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoEntry } from "../backend";
import { VideoPlatform, VideoType } from "../backend";

interface VideoModalProps {
  video: VideoEntry | null;
  onClose: () => void;
}

function formatViews(n: bigint): string {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getInstagramPostId(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([^/?#\s]+)/);
  return m ? m[1] : null;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function VideoModal({ video, onClose }: VideoModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const infoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isShortForm = video?.videoType === VideoType.short_;

  // Auto-hide info bar after 3s of no mouse movement over video
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

    // Start the auto-hide timer
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

  const isYouTube = video ? !!getYouTubeId(video.videoUrl) : false;

  return (
    <>
      <AnimatePresence>
        {video && (
          <motion.div
            ref={backdropRef}
            data-ocid="video.modal"
            className="fixed inset-0 z-50 flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            onMouseMove={resetInfoTimer}
          >
            {/* ── Close button (always top-right) ── */}
            <button
              type="button"
              data-ocid="video.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "oklch(0.06 0 0 / 0.85)",
                border: "1px solid oklch(0.82 0.22 193 / 0.35)",
                color: "oklch(0.92 0.01 240)",
                boxShadow: "0 0 12px oklch(0.82 0.22 193 / 0.2)",
              }}
              aria-label="Close video"
            >
              <X size={18} />
            </button>

            {/* ── Video area ── */}
            <motion.div
              className="flex-1 flex items-center justify-center relative overflow-hidden"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {/* Short-form: 9:16 centered */}
              {isShortForm ? (
                <div
                  className="relative h-full"
                  style={{ aspectRatio: "9/16", maxHeight: "100%" }}
                >
                  {video.platform === VideoPlatform.instagram ? (
                    <iframe
                      title={video.title}
                      src={`https://www.instagram.com/p/${getInstagramPostId(video.videoUrl) ?? ""}/embed`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : isYouTube ? (
                    <iframe
                      title={video.title}
                      src={`https://www.youtube.com/embed/${getYouTubeId(video.videoUrl)}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : (
                    // biome-ignore lint/a11y/useMediaCaption: user-uploaded videos may not have captions
                    <video
                      ref={videoRef}
                      src={video.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      style={{ background: "black" }}
                    />
                  )}
                </div>
              ) : (
                /* Long-form: 16:9 fill width */
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "16/9", maxHeight: "100vh" }}
                >
                  {video.platform === VideoPlatform.instagram ? (
                    <iframe
                      title={video.title}
                      src={`https://www.instagram.com/p/${getInstagramPostId(video.videoUrl) ?? ""}/embed`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : isYouTube ? (
                    <iframe
                      title={video.title}
                      src={`https://www.youtube.com/embed/${getYouTubeId(video.videoUrl)}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : (
                    // biome-ignore lint/a11y/useMediaCaption: user-uploaded videos may not have captions
                    <video
                      ref={videoRef}
                      src={video.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      style={{ background: "black" }}
                    />
                  )}
                </div>
              )}

              {/* ── Info overlay bar (auto-hides) ── */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 px-6 py-4 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0 0 0 / 0.92) 0%, oklch(0 0 0 / 0.6) 60%, transparent 100%)",
                }}
                animate={{ opacity: showInfo ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {video.featured && (
                        <span
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
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
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{
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
                      className="text-lg font-bold leading-snug line-clamp-2 mb-1"
                      style={{
                        fontFamily: '"Bricolage Grotesque", sans-serif',
                        color: "oklch(0.97 0.01 240)",
                        textShadow: "0 2px 12px oklch(0 0 0 / 0.8)",
                      }}
                    >
                      {video.title}
                    </h2>

                    {/* Meta */}
                    <div
                      className="flex items-center gap-4 text-xs"
                      style={{ color: "oklch(0.65 0.02 240)" }}
                    >
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {formatViews(video.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(video.uploadDate)}
                      </span>
                      <span
                        className="capitalize px-1.5 py-0.5 rounded text-xs"
                        style={{
                          background: "oklch(0.14 0.008 240 / 0.8)",
                        }}
                      >
                        {video.platform}
                      </span>
                    </div>
                  </div>

                  {/* Hint icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetInfoTimer();
                    }}
                    className="pointer-events-auto opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: "oklch(0.82 0.22 193)" }}
                    title="Show info"
                    aria-label="Show info bar"
                  >
                    {showInfo ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
