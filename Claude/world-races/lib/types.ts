export type Sport =
  | "running"
  | "cycling"
  | "triathlon"
  | "swimming"
  | "multisport"
  | "trail"
  | "walking"
  | "strength"
  | "yoga"
  | "crossfit"
  | "pilates"
  | "climbing"
  | "boxing"
  | "martial_arts"
  | "dance"
  | "hiking"
  | "skiing"
  | "surfing"
  | "rowing"
  | "tennis";

export type ElevationPoint = { km: number; elev: number };

export type RaceStatus = "upcoming" | "past" | "cancelled";

export type Race = {
  id: string;
  slug: string;
  name_en: string;
  name_he: string | null;
  sport: Sport;
  discipline: string | null;
  distance_km: number | null;
  elevation_gain_m: number | null;
  elevation_loss_m: number | null;
  elevation_profile: ElevationPoint[] | null;
  date_start: string; // ISO date
  date_end: string | null;
  country_code: string; // ISO 3166 alpha-2
  region: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  official_url: string | null;
  registration_url: string | null;
  currency: string | null;
  price_min: number | null;
  price_max: number | null;
  participants_estimated: number | null;
  image_url: string | null;
  description_en: string | null;
  description_he: string | null;
  tags: string[];
  status: RaceStatus;
  source: string | null;
  source_url: string | null;
  difficulty: number | null;
  avg_finish_seconds: number | null;
  course_record_men_seconds: number | null;
  course_record_women_seconds: number | null;
  course_record_men_holder: string | null;
  course_record_women_holder: string | null;
  course_record_year: number | null;
  start_lat: number | null;
  start_lng: number | null;
  finish_lat: number | null;
  finish_lng: number | null;
  route_geojson: GeoJSON.LineString | GeoJSON.MultiLineString | null;
  created_at: string;
  updated_at: string;
};

export type RaceResult = {
  id: string;
  race_id: string;
  year: number;
  position: number;
  runner_name: string;
  runner_country: string | null;
  gender: "M" | "F" | "X" | null;
  finish_seconds: number | null;
  age_group: string | null;
  source: string | null;
  created_at: string;
};


export type AidStationService =
  | "water"
  | "sport_drink"
  | "gel"
  | "fruit"
  | "solid_food"
  | "soup"
  | "medical"
  | "toilets"
  | "drop_bag"
  | "cutoff";

export type AidStation = {
  id: string;
  race_id: string;
  position: number;
  km: number;
  name: string | null;
  services: AidStationService[];
  cutoff_seconds: number | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
};


export type RaceCourse = {
  id: string;
  race_id: string;
  position: number;
  name_en: string;
  name_he: string | null;
  discipline: string | null;
  distance_km: number | null;
  elevation_gain_m: number | null;
  cutoff_seconds: number | null;
  participants_estimated: number | null;
  price: number | null;
  currency: string | null;
  notes_en: string | null;
  notes_he: string | null;
  created_at: string;
};


export type UserRaceStatus = "interested" | "registered" | "completed" | "dnf";

export type UserRace = {
  id: string;
  user_id: string;
  race_id: string;
  course_id: string | null;
  status: UserRaceStatus;
  notes: string | null;
  finish_seconds: number | null;
  created_at: string;
  updated_at: string;
};


export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  country_code: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Follow = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  race_id: string | null;
  body: string;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type PostWithAuthor = Post & {
  profile: Profile | null;
  race: Race | null;
  liked_by_me?: boolean;
};


export type TravelRadius = "local" | "regional" | "continental" | "global";
export type ClimatePreference = "cold" | "temperate" | "warm" | "any";
export type DistanceCategoryKey =
  | "5k" | "10k" | "half" | "marathon"
  | "ultra50" | "ultra100k" | "ultra100m"
  | "ironman" | "half_ironman";

export type RunnerPreferences = {
  user_id: string;
  level: number | null;
  preferred_sports: Sport[];
  preferred_distances: DistanceCategoryKey[];
  pb_5k_seconds: number | null;
  pb_10k_seconds: number | null;
  pb_half_seconds: number | null;
  pb_marathon_seconds: number | null;
  max_elevation_gain_m: number | null;
  travel_radius: TravelRadius;
  preferred_country_codes: string[];
  preferred_months: number[];
  climate_preference: ClimatePreference;
  home_country_code: string | null;
  updated_at: string;
};


export type Review = {
  id: string;
  race_id: string;
  user_id: string;
  rating: number;
  course_rating: number | null;
  organization_rating: number | null;
  scenery_rating: number | null;
  title: string | null;
  body: string | null;
  attended_year: number | null;
  created_at: string;
  updated_at: string;
};

export type ReviewWithAuthor = Review & {
  profile: Profile | null;
};

export type RaceRatingStats = {
  race_id: string;
  review_count: number;
  avg_rating: number | null;
  avg_course: number | null;
  avg_org: number | null;
  avg_scenery: number | null;
};


export type Coach = {
  name: string;
  role?: string;
  bio?: string;
  photo_url?: string;
};

export type WeeklySlot = {
  day: number;          // 0=Sunday .. 6=Saturday
  time: string;         // "18:00"
  title: string;
  meeting?: string;
  pace?: string;
  sport?: string;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  strava?: string;
  youtube?: string;
};

export type Testimonial = {
  author: string;
  text: string;
  rating?: number;
};

export type Achievement = {
  year?: number;
  title: string;
  description?: string;
};

export type Club = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sports: Sport[];
  country_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  meeting_point: string | null;
  cover_url: string | null;
  logo_url: string | null;
  tagline: string | null;
  trial_session_text: string | null;
  coaches: Coach[];
  pricing_text: string | null;
  weekly_schedule: WeeklySlot[];
  social_links: SocialLinks;
  testimonials: Testimonial[];
  website_url: string | null;
  contact_email: string | null;
  is_public: boolean;
  is_secret: boolean;
  level: number | null;
  language: string | null;
  created_by: string;
  member_count: number;
  kind: "club" | "group" | "coach" | "studio";
  pricing_per_session: number | null;
  pricing_currency: string | null;
  years_experience: number | null;
  bio: string | null;
  background: string | null;
  philosophy: string | null;
  certifications: string[];
  specialties: string[];
  languages: string[];
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
};

export type ClubMember = {
  club_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
};

export type ClubMemberWithProfile = ClubMember & {
  profile: Profile | null;
};

export type TrainingSession = {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
  meeting_point: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  pace_target: string | null;
  capacity: number | null;
  is_public: boolean;
  created_by: string;
  attendee_count: number;
  created_at: string;
};

export type TrainingAttendeeStatus = "going" | "maybe" | "declined";

export type TrainingAttendee = {
  session_id: string;
  user_id: string;
  status: TrainingAttendeeStatus;
  created_at: string;
};


export type SubscriptionTier = "free" | "pro" | "elite";
export type SubscriptionStatus = "active" | "past_due" | "canceled";

export type Subscription = {
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type TrainingLogType =
  | "easy" | "tempo" | "interval" | "long" | "race" | "recovery" | "cross";

export type TrainingLog = {
  id: string;
  user_id: string;
  race_id: string | null;
  date: string;
  type: TrainingLogType;
  distance_km: number | null;
  duration_seconds: number | null;
  pace_seconds_per_km: number | null;
  elevation_gain_m: number | null;
  avg_heart_rate: number | null;
  perceived_effort: number | null;
  notes: string | null;
  weather: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};


export type ClubPhoto = {
  id: string;
  club_id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export type EventType =
  | "training" | "race" | "meet" | "workshop"
  | "social" | "clinic" | "gear_swap" | "charity" | "other";

export type ClubEvent = {
  id: string;
  club_id: string;
  event_type: EventType;
  sport: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  city: string | null;
  country_code: string | null;
  lat: number | null;
  lng: number | null;
  capacity: number | null;
  open_to_non_members: boolean;
  price: number | null;
  currency: string | null;
  registration_url: string | null;
  rsvp_count: number;
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EventRsvpStatus = "going" | "maybe" | "declined" | "waitlist";
export type EventRsvp = {
  event_id: string;
  user_id: string;
  status: EventRsvpStatus;
  guest_count: number;
  created_at: string;
};

export type TraineeInquiry = {
  id: string;
  club_id: string;
  name: string;
  email: string;
  phone: string | null;
  experience: string | null;
  goals: string | null;
  preferred_sports: string[];
  message: string | null;
  status: "new" | "contacted" | "converted" | "declined";
  created_at: string;
};


export type ProgressPost = {
  id: string;
  club_id: string;
  user_id: string;
  race_id: string | null;
  title: string | null;
  body: string;
  milestone: string | null;
  image_url: string | null;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type ProgressPostWithAuthor = ProgressPost & {
  profile: Profile | null;
  race: Race | null;
};

export type TipCategory =
  | "training" | "nutrition" | "recovery" | "mental" | "gear" | "race";

export type Tip = {
  id: string;
  club_id: string | null;
  author_id: string;
  category: TipCategory;
  sport: string | null;
  title: string;
  body: string;
  cover_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type TipWithAuthor = Tip & {
  author: Profile | null;
  club: Club | null;
};

export type UserGoalRace = {
  user_id: string;
  race_id: string;
  is_primary: boolean;
  goal_finish_seconds: number | null;
  notes: string | null;
  created_at: string;
};


export type ProgramLevel =
  | "beginner" | "intermediate" | "advanced" | "elite" | "all";

export type ProgramWeek = {
  week: number;
  focus?: string;
  sessions: { day?: number; type?: string; minutes?: number; description: string }[];
};

export type TrainingProgram = {
  id: string;
  slug: string;
  club_id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  sport: string;
  level: ProgramLevel;
  duration_weeks: number | null;
  sessions_per_week: number | null;
  weekly_volume_km: number | null;
  target_distance_km: number | null;
  target_event: string | null;
  cover_url: string | null;
  body: string | null;
  weekly_schedule: ProgramWeek[];
  price: number | null;
  currency: string | null;
  is_published: boolean;
  follower_count: number;
  view_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TrainingProgramWithClub = TrainingProgram & {
  club: Club | null;
};

export type RaceInsert = Omit<Race, "id" | "created_at" | "updated_at">;
