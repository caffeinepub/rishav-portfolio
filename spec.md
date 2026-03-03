# Rishav Portfolio

## Current State

Full-stack portfolio site on the Internet Computer (Motoko backend + React frontend).
- Backend has: video CRUD, categories, services, testimonials, site content, theme settings, section config, media library, blob storage, authorization
- Frontend has: dark cinematic glassmorphism UI, hero (RISHAV name reveal), short/long form video grids, featured slider, services, about, contact/WhatsApp, admin panel with password login (`ffrishav9395889127`)
- Video system previously supported YouTube URLs, Instagram links, and file uploads
- Admin panel had YouTube/Instagram URL fields and auto-thumbnail from YouTube

## Requested Changes (Diff)

### Add
- Direct video file upload ONLY via drag-and-drop zone in admin (mp4/mov/webm, max 500MB)
- Upload progress bar during file transfer to blob storage
- Client-side auto-thumbnail extraction at 50% of video timeline using canvas
- Client-side auto-duration detection using HTMLVideoElement.duration
- Duration badge (mm:ss) on every video card (bottom-right corner)
- Duration stored per video in backend
- Admin video cards show: video preview, thumbnail preview, duration badge, Regenerate Thumbnail + Replace Video + Delete buttons
- Admin dashboard shows total video count

### Modify
- VideoForm: remove platform selector, YouTube URL field, Instagram URL field; replace with file upload dropzone
- VideoEntry backend type: keep title, videoUrl, thumbnailUrl, duration, views, uploadDate, category, featured, videoType, order; remove platform field entirely
- Video modal: plays only direct video files (no iframe embeds), uses React Player or native `<video>` tag
- Short-form cards: 2 cols mobile, 4 cols desktop, 9:16 ratio, thumbnail + duration badge
- Long-form cards: 1 col mobile, 3 cols desktop, 16:9 ratio, thumbnail + duration badge
- Admin section config to still toggle all sections

### Remove
- Platform field (`#upload | #youtube | #instagram`) from VideoEntry
- YouTube URL auto-thumbnail generation
- Instagram embed/blockquote logic
- All `extractYouTubeId`, `detectPlatform`, `getInstagramPostId` helpers
- `instgrm.Embeds.process()` calls and embed.js script injection
- Any iframe used for video playback; replace with native `<video>` / React Player with direct URL

## Implementation Plan

1. Update Motoko backend: remove platform variant from VideoEntry, keep all other fields
2. Update frontend VideoForm component: replace URL fields with file dropzone (drag-and-drop), show progress, auto-extract thumbnail+duration client-side via canvas
3. Update VideoModal: remove iframe/YouTube/Instagram branches, use native `<video>` tag with controls
4. Update video card components: add duration badge overlay bottom-right
5. Update admin video list cards: show thumbnail preview, duration, Regenerate Thumbnail and Replace Video buttons
6. Update admin dashboard: add total video count stat
7. Clean up all unused YouTube/Instagram code paths
8. Validate typecheck and build pass cleanly
