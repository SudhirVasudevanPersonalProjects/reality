import { Database } from '@/lib/supabase/database.types'

export type Something = Database['public']['Tables']['somethings']['Row']

export interface SplitRequest {
  splits: Array<{
    text_content: string
    media_urls?: string[]
  }>
}

export interface SplitResponse {
  success: boolean
  splits: Array<{
    id: string
    text_content: string
    parent_id: string
  }>
  error?: string
}

export interface SplitModalProps {
  something: Something
  onComplete: (firstChildId?: string) => void
  onCancel: () => void
}

export interface SuggestedSplit {
  text_content: string
  media_urls: string[]
}
