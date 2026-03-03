# Rishav Portfolio

## Current State

Full-stack React + Motoko portfolio for a video editor named Rishav. The frontend uses Framer Motion, Tailwind CSS, TanStack Router, and localStorage-based data persistence (bypassing the Motoko backend auth). Admin panel at `/admin` with password `ffrishav9395889127`. Videos open in a fullscreen cinematic modal using YouTube iframes and native video elements.

Known issues:
- `index.html` has an empty `<title>` tag and no meta description, OG tags, or favicon link
- Navbar nav links reference section IDs (`longform-section`, `services-section`, `about-section`, `contact-section`) that are only applied to wrapper `<div>` elements — some sections (e.g. `ShortFormSection`) have `id="shortform-section"` on the `<section>` but the inner `LongFormSection`, `ServicesSection`, `AboutSection`, `ContactSection` have no IDs on their actual DOM elements
- No scroll-to-top button
- No active navbar highlight on scroll
- No page load animation / loading screen
- Admin panel navbar link is visible in the public-facing navbar (security exposure)
- `no-scrollbar` Tailwind utility used in featured slider but not defined anywhere
- Mobile hamburger menu is missing — navbar has no mobile nav at all
- `Services` section grid can overflow on very small screens
- Video modal: YouTube Shorts embeds need `youtube.com/shorts/` pattern handled (already in `extractYouTubeId` but the modal's `getYouTubeId` only handles 3 patterns — Shorts URL missing)
- Seed videos all use the same `dQw4w9WgXcQ` placeholder URL with no thumbnails — results in empty thumbnail placeholders with no fallback image
- `index.css` references `/assets/fonts/MonaSans.woff2`, `/assets/fonts/BricolageGrotesque.woff2`, `/assets/fonts/Sora.woff2` — these don't exist in `public/assets/fonts/`, so fonts fall back to system fonts silently
- Missing `no-scrollbar` CSS class used on featured slider
- `overflow-x: hidden` on `body` but some flex/grid containers can still cause horizontal scroll on mobile
- No `<meta name="theme-color">` for mobile browsers
- No Open Graph / Twitter Card meta tags
- No `lang` attribute value on `<html>` (it has `lang="en"` — OK)
- `ServiceCard` grid uses `grid-cols-2 md:grid-cols-3` — on 320px screens 2 columns can cut off content
- Scroll progress bar exists but has no `no-js` fallback
- Contact section and About section have no `id` attributes for navbar scroll targeting

## Requested Changes (Diff)

### Add
- Proper `<title>`, `<meta description>`, OG tags, and favicon `<link>` in `index.html`
- `<meta name="theme-color">` tag
- Scroll-to-top button (appears after scrolling 400px, smooth scroll back to top)
- Active navbar link highlight based on current scroll position (IntersectionObserver)
- Mobile hamburger menu in the Navbar with a slide-down panel showing all nav links
- `no-scrollbar` CSS utility class in `index.css`
- Missing section `id` attributes: `longform-section`, `services-section`, `about-section`, `contact-section`, `featured-section`, `testimonials-section`
- Admin link removed from the public-facing navbar (hidden — only accessible via 5s hold on "View Portfolio")
- Google Fonts preconnect and font import fallback so fonts load even without local woff2 files
- Page load skeleton / fade-in animation on initial mount
- YouTube Shorts URL pattern fix in `VideoModal.tsx` `getYouTubeId` function

### Modify
- `index.html`: populate `<title>`, add meta tags, OG tags, favicon, theme-color
- `Navbar`: add mobile hamburger + slide-down menu, add active section highlighting, remove Admin link
- `PortfolioPage`: add section IDs to all sections, add ScrollToTop button component, add page load fade-in
- `index.css`: add `.no-scrollbar` utility, fix `overflow-x` containment
- `VideoModal.tsx`: add YouTube Shorts URL pattern to `getYouTubeId`
- `ServicesSection`: make grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` for better small-screen layout

### Remove
- Admin panel link from public navbar

## Implementation Plan

1. Update `index.html` with full SEO meta tags, OG tags, favicon link, theme-color
2. Add `.no-scrollbar` CSS to `index.css`, fix overflow containment
3. Fix `VideoModal.tsx` `getYouTubeId` to handle YouTube Shorts URLs
4. Update `PortfolioPage.tsx`:
   - Add `id` attributes to all section wrappers (`longform-section`, `services-section`, `about-section`, `contact-section`, etc.)
   - Remove Admin link from Navbar
   - Add active section tracking via IntersectionObserver in Navbar
   - Add mobile hamburger menu to Navbar
   - Update Services grid to `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
   - Add ScrollToTop button component
   - Add page-load fade-in wrapper
5. Validate build passes with zero TypeScript errors
