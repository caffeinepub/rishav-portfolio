# Rishav Portfolio — Super Admin CMS Expansion

## Current State

The portfolio already has:
- A password-protected admin login at `/admin` with password `ffrishav9395889127`
- Auth stored in `sessionStorage` (needs to move to `localStorage` per request)
- Admin dashboard at `/admin/dashboard` with sections: Hero, Short Form, Long Form, Categories, Services, About, Contact, Theme, Media Library, AI Studio
- Backend Motoko actor with: VideoEntry, Category, Service, SiteContent, ThemeSettings, MediaFile
- Portfolio frontend fully dynamic via React Query hooks, consuming all backend data
- Blob storage and authorization components already selected

## Requested Changes (Diff)

### Add
- **Testimonials** — full CRUD in backend and admin panel (client name, client image URL, review text, star rating 1-5); render testimonials section on portfolio page
- **Extended SiteContent fields** — `logoUrl`, `faviconUrl`, `seoTitle`, `seoDescription`, `seoKeywords`, `profileImageUrl`, `aboutStat1Label`, `aboutStat1Value`, `aboutStat2Label`, `aboutStat2Value`, `aboutStat3Label`, `aboutStat3Value`, `heroButtonText`, `heroButtonLink`, `viewPortfolioText`
- **Section visibility flags** — `sectionsEnabled` record in backend (hero, shortform, longform, featured, services, about, contact, testimonials each independently togglable)
- **Global Control admin module** — new admin section for: logo URL, favicon URL, SEO title/description/keywords, section enable/disable toggles
- **Testimonials admin module** — add/edit/delete testimonials with star rating picker
- **About stats editing** — 3 configurable stat blocks (value + label) editable from admin About section
- **Profile image** — editable URL in About section admin
- **Services show/hide** — each service card gets a `visible` boolean toggle in admin
- **Auth session in localStorage** — switch from `sessionStorage` to `localStorage`

### Modify
- **Backend `SiteContent`** — expand with new fields listed above
- **Backend `Service`** — add `visible: Bool` and `pricing: Text` fields
- **Admin Login page** — switch `sessionStorage` to `localStorage`
- **Admin Dashboard auth guard** — switch `sessionStorage` to `localStorage`
- **Admin logout** — switch `sessionStorage` to `localStorage`
- **About section (portfolio)** — stats now driven by `siteContent` dynamic values; profile image uses `siteContent.profileImageUrl` 
- **Testimonials section** — add new section to `PortfolioPage`, hidden when no testimonials, auto-shown when testimonials exist; respects section visibility flag
- **All portfolio sections** — respect `sectionsEnabled` flags to show/hide
- **NAV_ITEMS in AdminDashboard** — add "Testimonials" and "Global" sections

### Remove
- Nothing removed from existing design/UI

## Implementation Plan

1. **Backend**: Regenerate `main.mo` with expanded `SiteContent` (logo, favicon, SEO, profile image, about stats, hero button fields), expanded `Service` (visible + pricing), new `Testimonial` type with CRUD, and `SectionConfig` type for section enable/disable flags stored as a record.
2. **Frontend backend.d.ts**: Update types to match new backend.
3. **useQueries.ts**: Add testimonial hooks (useAllTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial), useGetSectionConfig, useUpdateSectionConfig; update existing hooks for new SiteContent fields; update service mutations for new fields.
4. **AdminLoginPage**: Change `sessionStorage` → `localStorage`.
5. **AdminDashboardPage**: 
   - Add `global` and `testimonials` nav items
   - Add `GlobalControl` section (logo, favicon, SEO, section toggles)
   - Add `TestimonialsManager` section (CRUD with star rating)
   - Expand `AboutEditor` with profile image + 3 stat blocks
   - Add `visible`/`pricing` toggles to ServicesManager
6. **PortfolioPage**: 
   - Testimonials section (renders if testimonials.length > 0 and section enabled)
   - About stats driven from siteContent dynamic values
   - About profile image from siteContent.profileImageUrl
   - All sections respect sectionConfig flags
   - SEO meta tags injected into document head via useEffect
