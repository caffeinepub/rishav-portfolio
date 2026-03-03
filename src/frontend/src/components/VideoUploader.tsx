import { Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ExternalBlob } from "../backend";
import type { VideoType } from "../backend";
import { VideoType as VT } from "../backend";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_MB = 500;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPTED_EXT = ".mp4,.mov,.webm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoUploaderResult {
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

interface VideoUploaderProps {
  videoType: VideoType;
  onUploadComplete: (result: VideoUploaderResult) => void;
  onError: (msg: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Spinner keyframes — injected once into <head> */
const SPINNER_ID = "video-uploader-spinner-kf";
function ensureSpinnerKF() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPINNER_ID)) return;
  const s = document.createElement("style");
  s.id = SPINNER_ID;
  s.textContent = "@keyframes vu-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}

/**
 * Extract video duration and generate a thumbnail from canvas at 50% of timeline.
 * Returns { durationSeconds, thumbnailDataUrl }.
 */
async function extractVideoMeta(
  objectUrl: string,
  thumbW: number,
  thumbH: number,
): Promise<{ durationSeconds: number; thumbnailDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        // Try to seek anyway
        video.currentTime = 0.5;
      } else {
        video.currentTime = duration * 0.5;
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = thumbW;
        canvas.height = thumbH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(video, 0, 0, thumbW, thumbH);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({
          durationSeconds: Number.isFinite(video.duration) ? video.duration : 0,
          thumbnailDataUrl: dataUrl,
        });
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () =>
      reject(new Error("Failed to load video for thumbnail extraction"));
    video.src = objectUrl;
    video.load();
  });
}

/**
 * Convert a base64 data URL to a Uint8Array and upload via ExternalBlob.
 * Returns the direct URL.
 */
async function uploadDataUrlAsBlob(
  dataUrl: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const [, base64] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  let blob = ExternalBlob.fromBytes(bytes);
  if (onProgress) blob = blob.withUploadProgress(onProgress);
  // ExternalBlob.fromBytes returns synchronously with the URL after withUploadProgress registration
  // We call getDirectURL() which triggers the upload and returns the URL
  return blob.getDirectURL();
}

// ─── VideoUploader Component ──────────────────────────────────────────────────

export function VideoUploader({
  videoType,
  onUploadComplete,
  onError,
}: VideoUploaderProps) {
  ensureSpinnerKF();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stage, setStage] = useState<
    "idle" | "uploading_video" | "extracting" | "uploading_thumb" | "done"
  >("idle");
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Thumbnail dimensions by video type
  const thumbW = videoType === VT.short_ ? 720 : 1280;
  const thumbH = videoType === VT.short_ ? 1280 : 720;

  const processFile = useCallback(
    async (file: File) => {
      setErrorMsg(null);

      // Validation
      if (!ACCEPTED_TYPES.includes(file.type)) {
        const msg = `Unsupported file type: ${file.type || "unknown"}. Please upload .mp4, .mov, or .webm.`;
        setErrorMsg(msg);
        onError(msg);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        const msg = `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_MB} MB.`;
        setErrorMsg(msg);
        onError(msg);
        return;
      }

      setFileName(file.name);

      try {
        // ── Step 1: Upload video file ──────────────────────────────────────
        setStage("uploading_video");
        setVideoProgress(0);

        const fileBytes = new Uint8Array(await file.arrayBuffer());
        let videoBlob = ExternalBlob.fromBytes(fileBytes);
        videoBlob = videoBlob.withUploadProgress((pct) => {
          setVideoProgress(Math.round(pct));
        });
        const videoUrl = videoBlob.getDirectURL();
        setVideoProgress(100);

        // ── Step 2: Extract duration + thumbnail ───────────────────────────
        setStage("extracting");

        // Create a temporary object URL from the original file (not the blob URL)
        // so we can seek and capture a frame
        const objectUrl = URL.createObjectURL(file);
        let durationSeconds = 0;
        let thumbnailDataUrl = "";

        try {
          const meta = await extractVideoMeta(objectUrl, thumbW, thumbH);
          durationSeconds = meta.durationSeconds;
          thumbnailDataUrl = meta.thumbnailDataUrl;
        } catch {
          // Thumbnail extraction failed — continue without thumbnail
          thumbnailDataUrl = "";
        } finally {
          URL.revokeObjectURL(objectUrl);
        }

        // ── Step 3: Upload thumbnail ───────────────────────────────────────
        let thumbnailUrl = "";
        if (thumbnailDataUrl) {
          setStage("uploading_thumb");
          setThumbProgress(0);
          try {
            thumbnailUrl = await uploadDataUrlAsBlob(thumbnailDataUrl, (pct) =>
              setThumbProgress(Math.round(pct)),
            );
            setThumbProgress(100);
          } catch {
            // Thumbnail upload failed — continue without
            thumbnailUrl = "";
          }
        }

        // ── Done ──────────────────────────────────────────────────────────
        setStage("done");
        onUploadComplete({ videoUrl, thumbnailUrl, durationSeconds });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
        setErrorMsg(msg);
        setStage("idle");
        onError(msg);
      }
    },
    [thumbW, thumbH, onUploadComplete, onError],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const isUploading =
    stage === "uploading_video" ||
    stage === "extracting" ||
    stage === "uploading_thumb";

  const stageLabel = {
    idle: null,
    uploading_video: "Uploading video…",
    extracting: "Generating thumbnail…",
    uploading_thumb: "Uploading thumbnail…",
    done: "Upload complete!",
  }[stage];

  const overallProgress =
    stage === "uploading_video"
      ? videoProgress * 0.7 // video = 0-70%
      : stage === "extracting"
        ? 75
        : stage === "uploading_thumb"
          ? 75 + thumbProgress * 0.25
          : stage === "done"
            ? 100
            : 0;

  const reset = () => {
    setStage("idle");
    setVideoProgress(0);
    setThumbProgress(0);
    setErrorMsg(null);
    setFileName(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone — outer div handles drag events; inner label handles click-to-browse */}
      <div
        data-ocid="video.dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: "relative",
          border: isDragOver
            ? "2px solid oklch(0.82 0.22 193)"
            : "2px dashed oklch(0.82 0.22 193 / 0.4)",
          borderRadius: "12px",
          background: isDragOver
            ? "oklch(0.12 0.008 193 / 0.3)"
            : "oklch(0.08 0.004 240)",
          padding: "32px 24px",
          textAlign: "center",
          cursor: isUploading ? "default" : "pointer",
          transition:
            "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
          boxShadow: isDragOver
            ? "0 0 20px oklch(0.82 0.22 193 / 0.15)"
            : "none",
          outline: "none",
        }}
      >
        {/* File input — the label below acts as the click trigger */}
        <input
          ref={inputRef}
          id="video-uploader-input"
          type="file"
          accept={ACCEPTED_EXT}
          onChange={handleFileInput}
          style={{ display: "none" }}
          data-ocid="video.upload_button"
        />

        {isUploading ? (
          /* Uploading state */
          <div className="flex flex-col items-center gap-3">
            {/* Neon spinner */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "3px solid transparent",
                borderTopColor: "oklch(0.82 0.22 193)",
                animation: "vu-spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "oklch(0.82 0.22 193)",
              }}
            >
              {stageLabel}
            </p>
            {fileName && (
              <p
                style={{
                  fontSize: "11px",
                  color: "oklch(0.5 0.02 240)",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </p>
            )}
          </div>
        ) : stage === "done" ? (
          /* Done state */
          <div className="flex flex-col items-center gap-2">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "oklch(0.82 0.22 193 / 0.15)",
                border: "2px solid oklch(0.82 0.22 193 / 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "oklch(0.82 0.22 193)",
              }}
            >
              ✓
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "oklch(0.82 0.22 193)",
              }}
            >
              Upload complete
            </p>
            {fileName && (
              <p
                style={{
                  fontSize: "11px",
                  color: "oklch(0.5 0.02 240)",
                }}
              >
                {fileName}
              </p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              style={{
                fontSize: "11px",
                color: "oklch(0.6 0.02 240)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Upload different file
            </button>
          </div>
        ) : (
          /* Idle state */
          <div className="flex flex-col items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "oklch(0.82 0.22 193 / 0.1)",
                border: "1px solid oklch(0.82 0.22 193 / 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "oklch(0.82 0.22 193)",
                transition: "transform 0.2s ease",
                transform: isDragOver ? "scale(1.1)" : "scale(1)",
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "oklch(0.82 0.01 240)",
                  marginBottom: "4px",
                }}
              >
                {isDragOver ? "Drop to upload" : "Drag & drop video here"}
              </p>
              <p style={{ fontSize: "11px", color: "oklch(0.5 0.02 240)" }}>
                MP4, MOV, or WebM · Max {MAX_FILE_MB} MB
              </p>
            </div>
            <label
              htmlFor="video-uploader-input"
              style={{
                fontSize: "11px",
                color: "oklch(0.82 0.22 193 / 0.8)",
                background: "oklch(0.82 0.22 193 / 0.08)",
                border: "1px solid oklch(0.82 0.22 193 / 0.2)",
                borderRadius: "6px",
                padding: "4px 12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              or click to browse
            </label>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(isUploading || stage === "done") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "oklch(0.15 0.008 240)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "2px",
                width: `${overallProgress}%`,
                background:
                  "linear-gradient(90deg, oklch(0.82 0.22 193), oklch(0.75 0.18 220))",
                boxShadow: "0 0 8px oklch(0.82 0.22 193 / 0.5)",
                transition: "width 0.25s ease",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "oklch(0.5 0.02 240)",
              textAlign: "right",
            }}
          >
            {Math.round(overallProgress)}%
          </p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div
          data-ocid="video.error_state"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "oklch(0.7 0.22 25 / 0.08)",
            border: "1px solid oklch(0.7 0.22 25 / 0.3)",
          }}
        >
          <X
            size={13}
            style={{
              color: "oklch(0.7 0.18 25)",
              flexShrink: 0,
              marginTop: "1px",
            }}
          />
          <p
            style={{ fontSize: "12px", color: "oklch(0.72 0.18 25)", flex: 1 }}
          >
            {errorMsg}
          </p>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "oklch(0.5 0.1 25)",
              flexShrink: 0,
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
