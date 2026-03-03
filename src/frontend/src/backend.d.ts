import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface SearchResult {
    services: Array<Service>;
    videos: Array<VideoEntry>;
}
export interface MediaFile {
    id: string;
    blob: ExternalBlob;
    name: string;
    uploadedAt: Time;
}
export type Time = bigint;
export interface Category {
    id: string;
    name: string;
    slug: string;
}
export interface Service {
    id: string;
    title: string;
    order: bigint;
    icon: string;
    description: string;
    pricing: string;
    visible: boolean;
}
export interface ThemeSettings {
    accentColor: string;
    darkMode: boolean;
    glowIntensity: GlowIntensity;
}
export interface VideoEntry {
    id: string;
    title: string;
    featured: boolean;
    duration: bigint;
    thumbnailUrl: string;
    order: bigint;
    views: bigint;
    platform: VideoPlatform;
    videoType: VideoType;
    category: string;
    videoUrl: string;
    uploadDate: Time;
}
export interface SiteContent {
    whatsappMessage: string;
    aboutStat2Label: string;
    seoTitle: string;
    heroHeading: string;
    aboutStat3Value: string;
    heroName: string;
    heroButtonLink: string;
    heroButtonText: string;
    aboutStat1Value: string;
    whatsappNumber: string;
    aboutStat3Label: string;
    logoUrl: string;
    seoKeywords: string;
    aboutText: string;
    viewPortfolioText: string;
    aboutStat1Label: string;
    seoDescription: string;
    faviconUrl: string;
    aboutStat2Value: string;
    profileImageUrl: string;
    aboutSubtext: string;
    heroTagline: string;
}
export interface SectionConfig {
    aboutEnabled: boolean;
    heroEnabled: boolean;
    servicesEnabled: boolean;
    shortformEnabled: boolean;
    featuredEnabled: boolean;
    testimonialsEnabled: boolean;
    contactEnabled: boolean;
    longformEnabled: boolean;
}
export interface Testimonial {
    id: string;
    review: string;
    clientImageUrl: string;
    clientName: string;
    order: bigint;
    rating: bigint;
}
export enum GlowIntensity {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VideoPlatform {
    instagram = "instagram",
    upload = "upload",
    youtube = "youtube"
}
export enum VideoType {
    long_ = "long",
    short_ = "short"
}
export interface backendInterface {
    addMediaFile(media: MediaFile): Promise<void>;
    aiProxy(_prompt: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(category: Category): Promise<void>;
    createService(service: Service): Promise<void>;
    createTestimonial(testimonial: Testimonial): Promise<void>;
    createVideo(video: VideoEntry): Promise<void>;
    deleteCategory(id: string): Promise<void>;
    deleteService(id: string): Promise<void>;
    deleteTestimonial(id: string): Promise<void>;
    deleteVideo(id: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllMediaFiles(): Promise<Array<MediaFile>>;
    getAllServices(): Promise<Array<Service>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getAllVideos(): Promise<Array<VideoEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(id: string): Promise<Category>;
    getMediaFile(id: string): Promise<MediaFile>;
    getSectionConfig(): Promise<SectionConfig>;
    getService(id: string): Promise<Service>;
    getSiteContent(): Promise<SiteContent>;
    getTestimonial(id: string): Promise<Testimonial>;
    getThemeSettings(): Promise<ThemeSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: string): Promise<VideoEntry>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    search(keyword: string): Promise<SearchResult>;
    updateCategory(id: string, category: Category): Promise<void>;
    updateSectionConfig(config: SectionConfig): Promise<void>;
    updateService(id: string, service: Service): Promise<void>;
    updateSiteContent(key: string, value: string): Promise<void>;
    updateTestimonial(id: string, testimonial: Testimonial): Promise<void>;
    updateThemeSettings(settings: ThemeSettings): Promise<void>;
    updateVideo(id: string, video: VideoEntry): Promise<void>;
}
