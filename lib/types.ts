export type UserRole = 'user' | 'admin'
export type BanStatus = 'active' | 'warned' | 'temp_banned' | 'permanent_banned'
export type RequestStatus = 'open' | 'resolved' | 'hidden' | 'deleted'
export type ReplyStatus = 'visible' | 'hidden' | 'deleted'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type BanType = 'warning' | 'temp_ban' | 'permanent_ban'
export type Category = 'romantic' | 'family' | 'friendship' | 'general'
export type ReportTargetType = 'request' | 'reply' | 'image'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  role: UserRole
  ban_status: BanStatus
  ban_expires_at: string | null
  created_at: string
}

export interface HelpRequest {
  id: string
  user_id: string
  title: string
  body: string
  category: Category
  is_private: boolean
  status: RequestStatus
  report_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
  request_images?: RequestImage[]
  reply_count?: number
}

export interface RequestImage {
  id: string
  request_id: string
  storage_path: string
  display_order: number
  report_count: number
  is_hidden: boolean
  created_at: string
}

export interface Reply {
  id: string
  request_id: string
  user_id: string
  body: string
  is_admin_reply: boolean
  status: ReplyStatus
  report_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  status: ReportStatus
  admin_id: string | null
  admin_notes: string | null
  created_at: string
  profiles?: Profile
}

export interface Ban {
  id: string
  user_id: string
  admin_id: string
  type: BanType
  reason: string
  expires_at: string | null
  created_at: string
  profiles?: Profile
}

export const CATEGORY_LABELS: Record<Category, string> = {
  romantic: 'Romantic Relationships',
  family: 'Family',
  friendship: 'Friendships',
  general: 'General',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  romantic: 'bg-rose-100 text-rose-700',
  family: 'bg-amber-100 text-amber-700',
  friendship: 'bg-purple-100 text-purple-700',
  general: 'bg-blue-100 text-blue-700',
}
