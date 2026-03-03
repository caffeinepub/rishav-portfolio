import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  // Legacy types from old actor
  type UserProfile = {
    name : Text;
    email : Text;
  };

  type LegacyGlowIntensity = {
    #low;
    #medium;
    #high;
  };

  type LegacySiteContent = {
    heroHeading : Text;
    heroName : Text;
    heroTagline : Text;
    whatsappNumber : Text;
    whatsappMessage : Text;
    aboutText : Text;
    aboutSubtext : Text;
  };

  type LegacyThemeSettings = {
    accentColor : Text;
    glowIntensity : LegacyGlowIntensity;
    darkMode : Bool;
  };

  type VideoPlatform = {
    #upload;
    #youtube;
    #instagram;
  };

  type VideoType = {
    #short;
    #long;
  };

  type VideoEntry = {
    id : Text;
    title : Text;
    platform : VideoPlatform;
    videoUrl : Text;
    thumbnailUrl : Text;
    views : Nat;
    uploadDate : Time.Time;
    duration : Nat;
    category : Text;
    featured : Bool;
    videoType : VideoType;
    order : Int;
  };

  type Category = {
    id : Text;
    name : Text;
    slug : Text;
  };

  type LegacyService = {
    id : Text;
    title : Text;
    description : Text;
    icon : Text;
    order : Int;
  };

  type LegacySearchResult = {
    videos : [VideoEntry];
    services : [LegacyService];
  };

  type MediaFile = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    uploadedAt : Time.Time;
  };

  type Testimonial = {
    id : Text;
    clientName : Text;
    clientImageUrl : Text;
    review : Text;
    rating : Nat; // 1-5
    order : Int;
  };

  type GlowIntensity = {
    #low;
    #medium;
    #high;
  };

  type LegacyActor = {
    siteContent : LegacySiteContent;
    themeSettings : LegacyThemeSettings;
    videos : Map.Map<Text, VideoEntry>;
    categories : Map.Map<Text, Category>;
    services : Map.Map<Text, LegacyService>;
    mediaLibrary : Map.Map<Text, MediaFile>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewSiteContent = {
    heroHeading : Text;
    heroName : Text;
    heroTagline : Text;
    whatsappNumber : Text;
    whatsappMessage : Text;
    aboutText : Text;
    aboutSubtext : Text;
    logoUrl : Text;
    faviconUrl : Text;
    seoTitle : Text;
    seoDescription : Text;
    seoKeywords : Text;
    profileImageUrl : Text;
    aboutStat1Label : Text;
    aboutStat1Value : Text;
    aboutStat2Label : Text;
    aboutStat2Value : Text;
    aboutStat3Label : Text;
    aboutStat3Value : Text;
    heroButtonText : Text;
    heroButtonLink : Text;
    viewPortfolioText : Text;
  };

  type ThemeSettings = {
    accentColor : Text;
    glowIntensity : GlowIntensity;
    darkMode : Bool;
  };

  type SectionConfig = {
    heroEnabled : Bool;
    shortformEnabled : Bool;
    longformEnabled : Bool;
    featuredEnabled : Bool;
    servicesEnabled : Bool;
    aboutEnabled : Bool;
    contactEnabled : Bool;
    testimonialsEnabled : Bool;
  };

  type Service = {
    id : Text;
    title : Text;
    description : Text;
    icon : Text;
    order : Int;
    visible : Bool;
    pricing : Text;
  };

  type NewActor = {
    siteContent : NewSiteContent;
    themeSettings : ThemeSettings;
    sectionConfig : SectionConfig;
    testimonials : Map.Map<Text, Testimonial>;
    videos : Map.Map<Text, VideoEntry>;
    categories : Map.Map<Text, Category>;
    services : Map.Map<Text, Service>;
    mediaLibrary : Map.Map<Text, MediaFile>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  func mapGlowIntensity(old : LegacyGlowIntensity) : GlowIntensity {
    switch (old) {
      case (#low) { #low };
      case (#medium) { #medium };
      case (#high) { #high };
    };
  };

  func mapLegacyServices(oldServices : Map.Map<Text, LegacyService>) : Map.Map<Text, Service> {
    oldServices.map<Text, LegacyService, Service>(
      func(_id, oldService) {
        {
          oldService with
          visible = true;
          pricing = "";
        };
      }
    );
  };

  // Migration entry point
  public func run(old : LegacyActor) : NewActor {
    let newSectionConfig : SectionConfig = {
      heroEnabled = true;
      shortformEnabled = true;
      longformEnabled = true;
      featuredEnabled = true;
      servicesEnabled = true;
      aboutEnabled = true;
      contactEnabled = true;
      testimonialsEnabled = true;
    };

    let mappedServices = mapLegacyServices(old.services);

    // Convert legacy siteContent to new extended one
    let newSiteContent = {
      old.siteContent with
      logoUrl = "";
      faviconUrl = "";
      seoTitle = "";
      seoDescription = "";
      seoKeywords = "";
      profileImageUrl = "";
      aboutStat1Label = "";
      aboutStat1Value = "";
      aboutStat2Label = "";
      aboutStat2Value = "";
      aboutStat3Label = "";
      aboutStat3Value = "";
      heroButtonText = "";
      heroButtonLink = "";
      viewPortfolioText = "";
    };

    let newThemeSettings = {
      old.themeSettings with
      glowIntensity = mapGlowIntensity(old.themeSettings.glowIntensity);
    };

    let testimonials = Map.empty<Text, Testimonial>();

    {
      old with
      testimonials;
      services = mappedServices;
      sectionConfig = newSectionConfig;
      siteContent = newSiteContent;
      themeSettings = newThemeSettings;
    };
  };
};
