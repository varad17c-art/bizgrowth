import { Request } from 'express';

// ============================================================
// User Types
// ============================================================

export type UserRole = 'client' | 'consultant' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'inactive';

/** Database row shape (snake_case — matches PostgreSQL columns) */
export interface UserRow {
  id: string; // auth_user_id (users.id)
  profile_id: string; // profiles.id
  email: string;
  password?: string; // password_hash from users
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  bio: string;
  phone: string;
  avatar_url: string;
  company_name: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedin_url: string;
  experience_years: number;
  created_at: string;
  updated_at: string;
}

/** Application-layer user (camelCase) */
export interface IUser {
  id: string; // users.id (auth_user_id)
  profileId: string; // profiles.id
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  name: string; // Dynamic combination of firstName + lastName
  role: UserRole;
  status: UserStatus;
  bio: string;
  phone: string;
  avatarUrl: string;
  companyName: string;
  company: string; // Maps to companyName for backward compatibility
  industry: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedinUrl: string;
  experienceYears: number;
  createdAt: Date;
  updatedAt: Date;
}

/** User object without sensitive fields (password) */
export type SafeUser = Omit<IUser, 'password'>;

// ============================================================
// User Profile Types
// ============================================================

/** Fields that a user can update on their own profile */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  name?: string; // Maps to firstName/lastName splits
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  company?: string; // Maps to companyName
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  linkedinUrl?: string;
  experienceYears?: number;
}

/** Fields that an admin can update on any user */
export interface AdminUpdateUserInput extends UpdateProfileInput {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
}

/** Pagination query parameters */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: string;
  industry?: string;
  sortBy?: 'name' | 'created_at' | 'company';
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// Auth Types
// ============================================================

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: true;
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: true;
  accessToken: string;
}

// ============================================================
// Express Augmentation
// ============================================================

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  params: Record<string, string>;
}

// ============================================================
// Error Types
// ============================================================

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>[];
}

// ============================================================
// Organization Types
// ============================================================

export interface OrganizationRow {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IOrganization {
  id: string;
  name: string;
  description: string;
  industry: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  industry?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  industry?: string;
}

// ============================================================
// Marketplace / Listings Types
// ============================================================

export type ListingType = 'sell' | 'buy' | 'partner' | 'supplier' | 'investor';
export type ListingStatus = 'active' | 'inactive' | 'closed' | 'draft';

export interface ListingRow {
  id: string;
  title: string;
  description: string | null;
  type: ListingType;
  industry: string | null;
  budget: string | null;
  currency: string;
  location: string | null;
  tags: string[];
  status: ListingStatus;
  user_id: string;
  org_id: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface IListing {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  industry: string;
  budget: number | null;
  currency: string;
  location: string;
  tags: string[];
  status: ListingStatus;
  userId: string;
  orgId: string | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  type: ListingType;
  industry?: string;
  budget?: number;
  currency?: string;
  location?: string;
  tags?: string[];
  orgId?: string;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  type?: ListingType;
  industry?: string;
  budget?: number;
  currency?: string;
  location?: string;
  tags?: string[];
  status?: ListingStatus;
}

// ============================================================
// Events Types
// ============================================================

export type EventType = 'conclave' | 'webinar' | 'conference' | 'workshop' | 'networking' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'draft';
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  status: EventStatus;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  capacity: number | null;
  registration_fee: string | null;
  currency: string;
  thumbnail_url: string | null;
  tags: string[];
  organizer_id: string;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  eventDate: Date;
  endDate: Date | null;
  location: string;
  isVirtual: boolean;
  virtualLink: string;
  capacity: number | null;
  registrationFee: number;
  currency: string;
  thumbnailUrl: string;
  tags: string[];
  organizerId: string;
  orgId: string | null;
  createdAt: Date;
  updatedAt: Date;
  attendeeCount?: number;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  type?: EventType;
  eventDate: string;
  endDate?: string;
  location?: string;
  isVirtual?: boolean;
  virtualLink?: string;
  capacity?: number;
  registrationFee?: number;
  currency?: string;
  thumbnailUrl?: string;
  tags?: string[];
  orgId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  type?: EventType;
  status?: EventStatus;
  eventDate?: string;
  endDate?: string;
  location?: string;
  isVirtual?: boolean;
  virtualLink?: string;
  capacity?: number;
  registrationFee?: number;
  thumbnailUrl?: string;
  tags?: string[];
}

export interface EventRegistrationRow {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface IEventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
}

// ============================================================
// Content / Knowledge Hub Types
// ============================================================

export type ContentType = 'article' | 'video' | 'podcast' | 'brochure' | 'insight' | 'report';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface ContentRow {
  id: string;
  title: string;
  body: string | null;
  summary: string | null;
  type: ContentType;
  status: ContentStatus;
  author_id: string;
  tags: string[];
  industry: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  views: number;
  read_time_mins: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IContent {
  id: string;
  title: string;
  body: string;
  summary: string;
  type: ContentType;
  status: ContentStatus;
  authorId: string;
  tags: string[];
  industry: string;
  thumbnailUrl: string;
  mediaUrl: string;
  views: number;
  readTimeMins: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentInput {
  title: string;
  body?: string;
  summary?: string;
  type: ContentType;
  tags?: string[];
  industry?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  readTimeMins?: number;
  status?: ContentStatus;
}

export interface UpdateContentInput {
  title?: string;
  body?: string;
  summary?: string;
  type?: ContentType;
  status?: ContentStatus;
  tags?: string[];
  industry?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  readTimeMins?: number;
}

// ============================================================
// Consultant Types
// ============================================================

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface ConsultantProfileRow {
  id: string;
  user_id: string;
  tagline: string | null;
  expertise: string[];
  certifications: string[];
  languages: string[];
  hourly_rate: string | null;
  currency: string;
  availability: AvailabilityStatus;
  min_engagement: string | null;
  portfolio_url: string | null;
  is_verified: boolean;
  total_reviews: number;
  avg_rating: string | null;
  created_at: string;
  updated_at: string;
}

export interface IConsultantProfile {
  id: string;
  userId: string;
  tagline: string;
  expertise: string[];
  certifications: string[];
  languages: string[];
  hourlyRate: number | null;
  currency: string;
  availability: AvailabilityStatus;
  minEngagement: string;
  portfolioUrl: string;
  isVerified: boolean;
  totalReviews: number;
  avgRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConsultantProfileInput {
  tagline?: string;
  expertise?: string[];
  certifications?: string[];
  languages?: string[];
  hourlyRate?: number;
  currency?: string;
  availability?: AvailabilityStatus;
  minEngagement?: string;
  portfolioUrl?: string;
}

export interface UpdateConsultantProfileInput extends CreateConsultantProfileInput {
  availability?: AvailabilityStatus;
}

export interface ServiceRow {
  id: string;
  consultant_id: string;
  title: string;
  description: string | null;
  price: string | null;
  currency: string;
  duration_hours: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IService {
  id: string;
  consultantId: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  durationHours: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceInput {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  durationHours?: number;
}

export interface UpdateServiceInput {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  durationHours?: number;
  isActive?: boolean;
}

// ============================================================
// Admin Types
// ============================================================

export interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalListings: number;
  totalEvents: number;
  totalContent: number;
  totalConsultants: number;
  activeListings: number;
  upcomingEvents: number;
  publishedContent: number;
  newUsersThisMonth: number;
}
