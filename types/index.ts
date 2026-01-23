// Karmora App Type Definitions

// User & Profile Types
export interface Profile {
  id: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ProductProfile {
  id: string
  user_id: string
  product_name: string
  one_liner: string
  icp: string
  website_url: string | null
  reply_style: ReplyStyle
  soft_mention: boolean
  created_at: string
  updated_at: string
}

export type ReplyStyle = 
  | 'helpful_concise' 
  | 'friendly_conversational' 
  | 'technical_direct'

export const REPLY_STYLE_LABELS: Record<ReplyStyle, string> = {
  helpful_concise: 'Helpful + concise',
  friendly_conversational: 'Friendly + conversational',
  technical_direct: 'Technical + direct',
}

// Subreddit Types
export interface SubredditTarget {
  id: string
  user_id: string
  subreddit: string
  created_at: string
}

// Lead Types
export type LeadStatus = 'new' | 'viewed' | 'dismissed'

export interface Lead {
  id: string
  user_id: string
  subreddit: string
  reddit_post_id: string
  title: string
  author: string
  url: string
  created_utc: string
  snippet: string | null
  status: LeadStatus
  score: number
  fetched_at: string
}

export interface GeneratedReply {
  id: string
  lead_id: string
  user_id: string
  reply_text: string
  provider: string
  created_at: string
}

// API Request/Response Types
export interface SaveOnboardingRequest {
  product: {
    productName: string
    oneLiner: string
    icp: string
    websiteUrl?: string
    replyStyle: ReplyStyle
    softMention: boolean
  }
  subreddits: string[]
}

export interface SaveOnboardingResponse {
  ok: boolean
  error?: string
}

export interface RefreshLeadsRequest {
  mode: 'last_7_days_new'
}

export interface RefreshLeadsResponse {
  added: number
  total: number
}

export interface GenerateReplyResponse {
  replyText: string
}

export interface UpdateLeadRequest {
  status: LeadStatus
}

// Onboarding State
export interface OnboardingState {
  currentStep: number
  product: {
    productName: string
    oneLiner: string
    icp: string
    websiteUrl: string
    replyStyle: ReplyStyle
    softMention: boolean
  }
  subreddits: string[]
  isComplete: boolean
}

// Filter State
export interface LeadsFilter {
  subreddit: string | 'all'
  status: LeadStatus | 'all'
  sort: 'newest' | 'oldest' | 'score'
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      product_profiles: {
        Row: ProductProfile
        Insert: Omit<ProductProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductProfile, 'id' | 'user_id'>>
      }
      subreddit_targets: {
        Row: SubredditTarget
        Insert: Omit<SubredditTarget, 'id' | 'created_at'>
        Update: Partial<Omit<SubredditTarget, 'id' | 'user_id'>>
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'fetched_at'>
        Update: Partial<Omit<Lead, 'id' | 'user_id'>>
      }
      generated_replies: {
        Row: GeneratedReply
        Insert: Omit<GeneratedReply, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
