import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
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

  type VideoPlatform = {
    #upload;
    #youtube;
    #instagram;
  };

  type VideoType = {
    #short;
    #long;
  };

  type Category = {
    id : Text;
    name : Text;
    slug : Text;
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

  type GlowIntensity = {
    #low;
    #medium;
    #high;
  };

  type MediaFile = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    uploadedAt : Time.Time;
  };

  type SearchResult = {
    videos : [VideoEntry];
    services : [Service];
  };

  // New Types
  public type Testimonial = {
    id : Text;
    clientName : Text;
    clientImageUrl : Text;
    review : Text;
    rating : Nat; // 1-5
    order : Int;
  };

  type SiteContent = {
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

  public type SectionConfig = {
    heroEnabled : Bool;
    shortformEnabled : Bool;
    longformEnabled : Bool;
    featuredEnabled : Bool;
    servicesEnabled : Bool;
    aboutEnabled : Bool;
    contactEnabled : Bool;
    testimonialsEnabled : Bool;
  };

  module VideoEntry {
    public func compare(videoEntry1 : VideoEntry, videoEntry2 : VideoEntry) : Order.Order {
      switch (Text.compare(videoEntry1.id, videoEntry2.id)) {
        case (#equal) { Text.compare(videoEntry1.title, videoEntry2.title) };
        case (order) { order };
      };
    };

    public func compareByTitle(videoEntry1 : VideoEntry, videoEntry2 : VideoEntry) : Order.Order {
      Text.compare(videoEntry1.title, videoEntry2.title);
    };
  };

  module Service {
    public func compare(service1 : Service, service2 : Service) : Order.Order {
      switch (Text.compare(service1.id, service2.id)) {
        case (#equal) { Text.compare(service1.title, service2.title) };
        case (order) { order };
      };
    };

    public func compareByTitle(service1 : Service, service2 : Service) : Order.Order {
      Text.compare(service1.title, service2.title);
    };
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      switch (Text.compare(category1.id, category2.id)) {
        case (#equal) { Text.compare(category1.name, category2.name) };
        case (order) { order };
      };
    };

    public func compareByName(category1 : Category, category2 : Category) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  var siteContent : SiteContent = {
    heroHeading = "Hello, I'm Rishav";
    heroName = "Rishav";
    heroTagline = "Video Editor Extraordinaire";
    whatsappNumber = "+1 123 456 7890";
    whatsappMessage = "Hey! Let's discuss your project.";
    aboutText = "Passionate video editor with a creative vision.";
    aboutSubtext = "Turning ideas into captivating stories.";
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

  var themeSettings : ThemeSettings = {
    accentColor = "#FF5733";
    glowIntensity = #medium;
    darkMode = false;
  };

  var sectionConfig : SectionConfig = {
    heroEnabled = true;
    shortformEnabled = true;
    longformEnabled = true;
    featuredEnabled = true;
    servicesEnabled = true;
    aboutEnabled = true;
    contactEnabled = true;
    testimonialsEnabled = true;
  };

  let videos = Map.empty<Text, VideoEntry>();
  let categories = Map.empty<Text, Category>();
  let services = Map.empty<Text, Service>();
  let mediaLibrary = Map.empty<Text, MediaFile>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let testimonials = Map.empty<Text, Testimonial>();

  // USER PROFILE MANAGEMENT
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // VIDEO CRUD - Admin only for modifications
  public shared ({ caller }) func createVideo(video : VideoEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create videos");
    };
    videos.add(video.id, video);
  };

  public shared ({ caller }) func updateVideo(id : Text, video : VideoEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    if (not videos.containsKey(id)) { Runtime.trap("Video not found") };
    videos.add(id, video);
  };

  public shared ({ caller }) func deleteVideo(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    if (not videos.containsKey(id)) { Runtime.trap("Video not found") };
    videos.remove(id);
  };

  public query func getVideo(id : Text) : async VideoEntry {
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query func getAllVideos() : async [VideoEntry] {
    videos.values().toArray().sort();
  };

  // CATEGORY CRUD - Admin only for modifications
  public shared ({ caller }) func createCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    categories.add(category.id, category);
  };

  public shared ({ caller }) func updateCategory(id : Text, category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    if (not categories.containsKey(id)) { Runtime.trap("Category not found") };
    categories.add(id, category);
  };

  public shared ({ caller }) func deleteCategory(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(id)) { Runtime.trap("Category not found") };
    categories.remove(id);
  };

  public query func getCategory(id : Text) : async Category {
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public query func getAllCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  // SERVICE CRUD - Admin only for modifications
  public shared ({ caller }) func createService(service : Service) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create services");
    };
    services.add(service.id, service);
  };

  public shared ({ caller }) func updateService(id : Text, service : Service) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    if (not services.containsKey(id)) { Runtime.trap("Service not found") };
    services.add(id, service);
  };

  public shared ({ caller }) func deleteService(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    if (not services.containsKey(id)) { Runtime.trap("Service not found") };
    services.remove(id);
  };

  public query func getService(id : Text) : async Service {
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) { service };
    };
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray().sort();
  };

  // SITE CONTENT MANAGEMENT - Admin only for updates, public for reads
  public shared ({ caller }) func updateSiteContent(key : Text, value : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site content");
    };
    var updatedContent = siteContent;
    switch (key) {
      case ("heroHeading") { updatedContent := { updatedContent with heroHeading = value } };
      case ("heroName") { updatedContent := { updatedContent with heroName = value } };
      case ("heroTagline") { updatedContent := { updatedContent with heroTagline = value } };
      case ("whatsappNumber") { updatedContent := { updatedContent with whatsappNumber = value } };
      case ("whatsappMessage") {
        updatedContent := { updatedContent with whatsappMessage = value };
      };
      case ("aboutText") { updatedContent := { updatedContent with aboutText = value } };
      case ("aboutSubtext") {
        updatedContent := { updatedContent with aboutSubtext = value };
      };
      case ("logoUrl") { updatedContent := { updatedContent with logoUrl = value } };
      case ("faviconUrl") { updatedContent := { updatedContent with faviconUrl = value } };
      case ("seoTitle") { updatedContent := { updatedContent with seoTitle = value } };
      case ("seoDescription") {
        updatedContent := { updatedContent with seoDescription = value };
      };
      case ("seoKeywords") {
        updatedContent := { updatedContent with seoKeywords = value };
      };
      case ("profileImageUrl") {
        updatedContent := { updatedContent with profileImageUrl = value };
      };
      case ("aboutStat1Label") {
        updatedContent := { updatedContent with aboutStat1Label = value };
      };
      case ("aboutStat1Value") {
        updatedContent := { updatedContent with aboutStat1Value = value };
      };
      case ("aboutStat2Label") {
        updatedContent := { updatedContent with aboutStat2Label = value };
      };
      case ("aboutStat2Value") {
        updatedContent := { updatedContent with aboutStat2Value = value };
      };
      case ("aboutStat3Label") {
        updatedContent := { updatedContent with aboutStat3Label = value };
      };
      case ("aboutStat3Value") {
        updatedContent := { updatedContent with aboutStat3Value = value };
      };
      case ("heroButtonText") {
        updatedContent := { updatedContent with heroButtonText = value };
      };
      case ("heroButtonLink") {
        updatedContent := { updatedContent with heroButtonLink = value };
      };
      case ("viewPortfolioText") {
        updatedContent := { updatedContent with viewPortfolioText = value };
      };
      case (_) { Runtime.trap("Invalid key") };
    };
    siteContent := updatedContent;
  };

  public query func getSiteContent() : async SiteContent {
    siteContent;
  };

  // THEME SETTINGS MANAGEMENT - Admin only for updates, public for reads
  public shared ({ caller }) func updateThemeSettings(settings : ThemeSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update theme settings");
    };
    themeSettings := settings;
  };

  public query func getThemeSettings() : async ThemeSettings {
    themeSettings;
  };

  // MEDIA LIBRARY MANAGEMENT - Admin only for uploads, public for reads
  public shared ({ caller }) func addMediaFile(media : MediaFile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add media files");
    };
    mediaLibrary.add(media.id, media);
  };

  public query func getMediaFile(id : Text) : async MediaFile {
    switch (mediaLibrary.get(id)) {
      case (null) { Runtime.trap("Media file not found") };
      case (?media) { media };
    };
  };

  public query func getAllMediaFiles() : async [MediaFile] {
    mediaLibrary.values().toArray();
  };

  // SEARCH FUNCTIONALITY - Public access
  public query func search(keyword : Text) : async SearchResult {
    let videosIter = videos.values();
    let filteredVideosList = List.empty<VideoEntry>();

    for (video in videosIter) {
      if (video.title.contains(#text keyword) or video.category.contains(#text keyword)) {
        filteredVideosList.add(video);
      };
    };

    let servicesIter = services.values();
    let filteredServicesList = List.empty<Service>();

    for (service in servicesIter) {
      if (
        service.title.contains(#text keyword) or service.description.contains(#text keyword)
      ) {
        filteredServicesList.add(service);
      };
    };

    let filteredVideos = filteredVideosList.toArray();
    let filteredServices = filteredServicesList.toArray();

    let result : SearchResult = {
      videos = filteredVideos;
      services = filteredServices;
    };
    result;
  };

  // TESTIMONIALS
  public shared ({ caller }) func createTestimonial(testimonial : Testimonial) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create testimonials");
    };
    testimonials.add(testimonial.id, testimonial);
  };

  public shared ({ caller }) func updateTestimonial(id : Text, testimonial : Testimonial) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update testimonials");
    };
    if (not testimonials.containsKey(id)) { Runtime.trap("Testimonial not found") };
    testimonials.add(id, testimonial);
  };

  public shared ({ caller }) func deleteTestimonial(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete testimonials");
    };
    if (not testimonials.containsKey(id)) {
      Runtime.trap("Testimonial not found");
    };
    testimonials.remove(id);
  };

  public query func getTestimonial(id : Text) : async Testimonial {
    switch (testimonials.get(id)) {
      case (null) { Runtime.trap("Testimonial not found") };
      case (?testimonial) { testimonial };
    };
  };

  public query func getAllTestimonials() : async [Testimonial] {
    testimonials.values().toArray();
  };

  // SECTION CONFIG
  public query func getSectionConfig() : async SectionConfig {
    sectionConfig;
  };

  public shared ({ caller }) func updateSectionConfig(config : SectionConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap(
        "Unauthorized: Only admins can update section configuration"
      );
    };
    sectionConfig := config;
  };

  // AI PROXY - Admin only to prevent abuse
  public query ({ caller }) func aiProxy(_prompt : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can use AI proxy");
    };
    Runtime.trap("AI proxy is handled on the frontend");
  };
};
