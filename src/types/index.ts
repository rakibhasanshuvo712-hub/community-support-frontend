export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  icon: string;
  is_restricted: boolean;
  restriction_note_en?: string | null;
  restriction_note_bn?: string | null;
  sort_order: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_signed_url?: string | null;
  bio?: string | null;
  role: "user" | "admin";
  is_suspended: boolean;
  preferred_language: "en" | "bn";
  location_city?: string | null;
  location_area?: string | null;
  created_at: string;
  contacts?: {
    email?: string | null;
    phone?: string | null;
    exact_address?: string | null;
  };
}

export interface PostImage {
  id: string;
  sort_order: number;
  url: string | null;
}

export interface PrivateDocument {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  signed_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  post_type: "donation_offer" | "help_request";
  donation_type: "money" | "item" | "service";
  category_id: string;
  title: string;
  description: string;
  quantity?: number | null;
  unit?: string | null;
  amount?: number | null;
  currency: string;
  location_city: string;
  location_area?: string | null;
  urgency: "low" | "medium" | "high" | "critical";
  status: "active" | "paused" | "fulfilled" | "closed" | "removed";
  safety_acknowledged: boolean;
  expires_at?: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    avatar_signed_url?: string | null;
    bio?: string | null;
    location_city?: string | null;
    location_area?: string | null;
  };
  category?: Category;
  images?: PostImage[];
  monetary_summary?: {
    pledged_total: number;
    confirmed_total: number;
  } | null;
  can_view_private_details?: boolean;
  private_details?: {
    exact_handover_address?: string | null;
    contact_phone?: string | null;
    contact_note?: string | null;
  } | null;
  private_documents?: PrivateDocument[];
}

export interface Claim {
  id: string;
  post_id: string;
  claimant_id: string;
  claim_type: "offer_to_donate" | "request_item";
  message?: string | null;
  quantity_offered?: number | null;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  donor_confirmed_handover: boolean;
  recipient_confirmed_handover: boolean;
  confirmed_at?: string | null;
  created_at: string;
  post?: Post;
  claimant?: { id: string; full_name: string; location_city?: string | null };
}

export interface Contribution {
  id: string;
  post_id: string;
  contributor_id: string;
  amount: number;
  currency: string;
  note?: string | null;
  status: "pledged" | "confirmed" | "cancelled";
  donor_confirmed: boolean;
  recipient_confirmed: boolean;
  confirmed_at?: string | null;
  created_at: string;
  post?: Post;
  contributor?: { id: string; full_name: string };
}

export interface Conversation {
  id: string;
  post_id?: string | null;
  created_at: string;
  updated_at: string;
  post?: { id: string; title: string; post_type: string; status: string } | null;
  participants: Array<{
    user_id: string;
    last_read_at?: string | null;
    profile: { id: string; full_name: string; avatar_url?: string | null };
  }>;
  last_message?: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}
