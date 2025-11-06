/**
 * Types for Chamber organization workflow
 */

export type RealmType = 'physical' | 'mind'

export interface OrganizeRequest {
  realm: RealmType
  care: number // 1-5
  location_name?: string // Required for physical
  latitude?: number // Mapbox geocoding coordinate
  longitude?: number // Mapbox geocoding coordinate
  formatted_address?: string // Full address from Mapbox
  tags?: string[] // Optional for mind
}

export interface OrganizeResponse {
  success: boolean
  something?: {
    id: string
    realm: RealmType
    care: number
    location_name?: string
    latitude?: number
    longitude?: number
    formatted_address?: string
    updated_at: string
  }
  error?: string
}
