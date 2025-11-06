'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import SplitModal from '@/app/components/SplitModal'
import CareSlider from '@/app/components/CareSlider'
import LocationInput from '@/app/components/LocationInput'

type Something = Database['public']['Tables']['somethings']['Row']

interface ChamberClientProps {
  something: Something
}

export default function ChamberClient({ something: initialSomething }: ChamberClientProps) {
  const router = useRouter()
  const [something, setSomething] = useState<Something>(initialSomething)
  const [showSplitCheckbox, setShowSplitCheckbox] = useState(false)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Organization state
  const [realm, setRealm] = useState<'physical' | 'mind' | null>(null)
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [formattedAddress, setFormattedAddress] = useState('')
  const [tags, setTags] = useState('')
  const [care, setCare] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Handle address selection from Mapbox autocomplete (Story 2.6: DO NOT change locationName!)
  const handleAddressSelect = (data: {
    latitude: number
    longitude: number
    placeName: string
    formattedAddress: string
  }) => {
    // CRITICAL: Do NOT overwrite locationName - user's personal label is preserved
    setLatitude(data.latitude)
    setLongitude(data.longitude)
    setFormattedAddress(data.formattedAddress)
    setWarningMessage(null) // Clear warning when coordinates captured
  }

  // Handle manual coordinate entry (Story 2.6)
  const handleManualCoordinates = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setFormattedAddress('') // NULL when manual coordinates
    setWarningMessage(null) // Clear warning when coordinates captured
  }

  // Clear coordinates when switching from physical to mind
  const handleRealmChange = (newRealm: 'physical' | 'mind') => {
    setRealm(newRealm)
    setErrorMessage(null)
    setWarningMessage(null)
    if (newRealm === 'mind') {
      setLatitude(null)
      setLongitude(null)
      setFormattedAddress('')
      setLocationName('')
    }
  }

  const handleOrganize = async () => {
    // Clear previous errors
    setErrorMessage(null)
    setWarningMessage(null)

    // Validate: realm and care selected
    if (!realm) {
      setErrorMessage('Please select Physical or Mind experience type')
      return
    }

    // If physical: validate location_name
    if (realm === 'physical' && !locationName.trim()) {
      setErrorMessage('Please enter a location for Physical experiences')
      return
    }

    // If physical: warn if no coordinates (Option 2: Allow with Warning)
    if (realm === 'physical' && (!latitude || !longitude)) {
      setWarningMessage('⚠️ No coordinates captured. Your location won\'t appear on the map until geocoded.')
    }

    setIsSubmitting(true)

    try {
      // Build request payload
      const payload: {
        realm: 'physical' | 'mind'
        care: number
        location_name?: string
        latitude?: number
        longitude?: number
        formatted_address?: string
        tags?: string[]
      } = {
        realm,
        care
      }

      if (realm === 'physical') {
        payload.location_name = locationName.trim()
        if (latitude && longitude) {
          payload.latitude = latitude
          payload.longitude = longitude
          payload.formatted_address = formattedAddress
        }
      }

      if (realm === 'mind' && tags.trim()) {
        // Parse comma-separated tags
        payload.tags = tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      }

      // Call organize API
      const response = await fetch(`/api/somethings/${something.id}/organize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to organize. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Success! Reload to fetch next unorganized something (FIFO)
      window.location.reload()

    } catch (error) {
      console.error('Error organizing:', error)
      setErrorMessage('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this capture? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/somethings/${something.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload to show next capture
        window.location.reload()
      } else {
        alert('Failed to delete capture. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error deleting capture:', error)
      alert('Failed to delete capture. Please try again.')
      setLoading(false)
    }
  }

  const handleSplitClick = () => {
    setSplitModalOpen(true)
  }

  const handleSplitComplete = (firstChildId?: string) => {
    setSplitModalOpen(false)
    setShowSplitCheckbox(false)
    // Force full page reload to show first split child
    if (firstChildId) {
      window.location.href = `/chamber?id=${firstChildId}`
    } else {
      // Fallback: reload to show next unorganized
      window.location.reload()
    }
  }

  const handleSplitCancel = () => {
    setSplitModalOpen(false)
    setShowSplitCheckbox(false)
  }

  // Allow split for any something (user may want to split single-line text or single media)
  const canSplit = () => {
    return true // Always allow split - user knows best
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-bold">Chamber of Reflection</h2>
            <Link
              href="/dashboard"
              prefetch={false}
              className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Current Something Display */}
        <div className="border border-gray-800 rounded-lg p-8 bg-gray-900/50 mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Current Capture</h3>

          {/* Text Content */}
          {something.text_content && (
            <div className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
              {something.text_content}
            </div>
          )}

          {/* Media Content */}
          {something.media_url && something.content_type === 'photo' && (
            <div className="mb-6">
              <img
                src={something.media_url}
                alt="Captured content"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}

          {something.media_url && something.content_type === 'video' && (
            <div className="mb-6">
              <video
                src={something.media_url}
                controls
                className="rounded-lg max-w-full h-auto"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
            Captured: {formatTimestamp(something.captured_at)}
          </div>
        </div>

        {/* Split Controls */}
        {canSplit() && (
          <div className="mb-8 border border-gray-800 rounded-lg p-6 bg-gray-900/30">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="split-checkbox"
                checked={showSplitCheckbox}
                onChange={(e) => setShowSplitCheckbox(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="split-checkbox" className="text-sm cursor-pointer">
                Split this into multiple somethings?
              </label>
            </div>

            {showSplitCheckbox && (
              <button
                onClick={handleSplitClick}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition font-semibold"
              >
                Open Split Editor
              </button>
            )}
          </div>
        )}

        {/* Organization Controls */}
        <div className="border-t border-gray-700 pt-6 mb-8">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-6 text-center">
            — OR ORGANIZE —
          </h3>

          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-400 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Physical vs Mind Selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-3">This is a:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="realm"
                    value="physical"
                    checked={realm === 'physical'}
                    onChange={(e) => handleRealmChange(e.target.value as 'physical')}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                  <span>○ Physical Experience</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="realm"
                    value="mind"
                    checked={realm === 'mind'}
                    onChange={(e) => handleRealmChange(e.target.value as 'mind')}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                  <span>○ Mind Experience</span>
                </label>
              </div>
            </div>

            {/* Conditional: Location for Physical */}
            {realm === 'physical' && (
              <div className="mb-6">
                <LocationInput
                  locationName={locationName}
                  onLocationNameChange={setLocationName}
                  onAddressSelect={handleAddressSelect}
                  onManualCoordinates={handleManualCoordinates}
                  required
                />
              </div>
            )}

            {/* Warning Message */}
            {warningMessage && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-400 text-sm">
                {warningMessage}
              </div>
            )}

            {/* Conditional: Tags for Mind */}
            {realm === 'mind' && (
              <div className="mb-6">
                <label htmlFor="tags-input" className="block text-sm text-gray-300 mb-2">
                  🏷️ Tags
                </label>
                <input
                  id="tags-input"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="coffee, social, reflection (comma-separated)"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-50"
                />
              </div>
            )}

            {/* Care Slider (Universal) */}
            {realm && (
              <div className="mb-6">
                <CareSlider
                  value={care}
                  onChange={setCare}
                  type={realm}
                />
              </div>
            )}

            {/* Organize & Continue Button */}
            <button
              onClick={handleOrganize}
              disabled={isSubmitting || !realm}
              className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Organizing...' : 'Organize & Continue'}
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 border border-red-700 text-red-400 rounded-md hover:bg-red-900/30 transition disabled:opacity-50"
          >
            Delete
          </button>

          <Link
            href="/dashboard"
            prefetch={false}
            className="px-6 py-3 border border-gray-700 rounded-md hover:bg-gray-900 transition"
          >
            Exit Chamber
          </Link>
        </div>
      </main>

      {/* Split Modal */}
      {splitModalOpen && (
        <SplitModal
          something={something}
          onComplete={handleSplitComplete}
          onCancel={handleSplitCancel}
        />
      )}
    </div>
  )
}
