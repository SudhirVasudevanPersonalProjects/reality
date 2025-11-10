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

  // Mind-specific state (Story 2.4 PATCH)
  const [mindCategory, setMindCategory] = useState<'experience' | 'thought' | 'desire'>('thought')
  const [why, setWhy] = useState<string>('')
  const [desireIntensity, setDesireIntensity] = useState<number>(0.5)
  const [desireStatus, setDesireStatus] = useState<'nascent' | 'active' | 'fulfilled'>('nascent')

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
      // Set smart default for mind category based on content
      setMindCategory(guessCategory(something))
    } else {
      // Clear mind-specific fields when switching to physical
      setMindCategory('thought')
      setWhy('')
      setDesireIntensity(0.5)
      setDesireStatus('nascent')
    }
  }

  // Smart category detection (Story 2.4 PATCH)
  const guessCategory = (something: Something): 'experience' | 'thought' | 'desire' => {
    const hasMedia = !!something.media_url
    const hasLocation = !!something.latitude
    const text = something.text_content?.toLowerCase() || ''

    // Experience indicators
    if (hasMedia && hasLocation) return 'experience'
    if (text.match(/\b(I (saw|went|visited|met|did)|today|yesterday)\b/)) return 'experience'

    // Desire indicators
    if (text.match(/\b(I want|I wish|I hope|goal|dream|aspire)\b/)) return 'desire'

    // Thought indicators (questions, analysis)
    if (text.match(/\b(why|how|what if|I think|I wonder|realize)\b/)) return 'thought'

    // Default to thought (safest)
    return 'thought'
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
        attributes?: {
          mind_category?: 'experience' | 'thought' | 'desire'
          why?: string
          desire_intensity?: number
          desire_status?: 'nascent' | 'active' | 'fulfilled'
          sun_domain?: string
        }
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

      if (realm === 'mind') {
        // Mind-specific attributes (Story 2.4 PATCH)
        payload.attributes = {
          mind_category: mindCategory,
          sun_domain: why.trim() ? undefined : 'somewhere' // Auto-assign 'somewhere' if no why
        }

        // Add why if provided
        if (why.trim()) {
          payload.attributes.why = why.trim()
        }

        // Add desire-specific fields if category is 'desire'
        if (mindCategory === 'desire') {
          payload.attributes.desire_intensity = desireIntensity
          payload.attributes.desire_status = desireStatus
        }

        // Parse comma-separated tags
        if (tags.trim()) {
          payload.tags = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        }
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
            <span suppressHydrationWarning>
              Captured: {formatTimestamp(something.captured_at)}
            </span>
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

            {/* Mind Category Dropdown (Story 2.4 PATCH) */}
            {realm === 'mind' && (
              <>
                <div className="mb-6 pb-6 border-b border-gray-800">
                  <label className="block text-sm text-gray-300 mb-3">
                    What kind of Mind something is this?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-gray-700 rounded-md cursor-pointer hover:bg-gray-800/50 transition">
                      <input
                        type="radio"
                        name="mindCategory"
                        value="experience"
                        checked={mindCategory === 'experience'}
                        onChange={(e) => setMindCategory(e.target.value as 'experience')}
                        disabled={isSubmitting}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium">🎭 Experience (Past Memory)</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Something that happened - a memory, event, or moment in time
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-gray-700 rounded-md cursor-pointer hover:bg-gray-800/50 transition">
                      <input
                        type="radio"
                        name="mindCategory"
                        value="thought"
                        checked={mindCategory === 'thought'}
                        onChange={(e) => setMindCategory(e.target.value as 'thought')}
                        disabled={isSubmitting}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium">💭 Thought (Present Reflection)</div>
                        <div className="text-xs text-gray-400 mt-1">
                          A reflection, insight, question, or analysis about something
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-gray-700 rounded-md cursor-pointer hover:bg-gray-800/50 transition">
                      <input
                        type="radio"
                        name="mindCategory"
                        value="desire"
                        checked={mindCategory === 'desire'}
                        onChange={(e) => setMindCategory(e.target.value as 'desire')}
                        disabled={isSubmitting}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium">✨ Desire (Future Aspiration)</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Something you want - a goal, aspiration, or future intention
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Why Field (Story 2.4 PATCH) */}
                <div className="mb-6">
                  <label htmlFor="why-field" className="block text-sm text-gray-300 mb-2">
                    Why does this matter to you? <span className="text-gray-500">(optional but encouraged)</span>
                  </label>
                  <textarea
                    id="why-field"
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    placeholder={
                      mindCategory === 'experience'
                        ? "What makes this memory meaningful? How did it shape you?"
                        : mindCategory === 'desire'
                        ? "Why do you want this? What deeper need does it fulfill?"
                        : "Why is this thought important? What does it reveal?"
                    }
                    disabled={isSubmitting}
                    maxLength={1000}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-50 resize-y"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs">
                      {why.trim() ? (
                        <span className="text-green-400">✨ Organized</span>
                      ) : (
                        <span className="text-gray-500">🗑️ Somewhere (will stay unorganized until you add a &quot;why&quot;)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {why.length}/1000
                    </div>
                  </div>
                </div>

                {/* Desire-Specific Fields (Story 2.4 PATCH) */}
                {mindCategory === 'desire' && (
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <div className="text-xs text-gray-400 mb-4">
                      These help you track the lifecycle of your desires - but they&apos;re optional
                    </div>

                    {/* Intensity Slider */}
                    <div className="mb-4">
                      <label htmlFor="desire-intensity" className="block text-sm text-gray-300 mb-2">
                        How strong is this desire?
                      </label>
                      <input
                        id="desire-intensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={desireIntensity}
                        onChange={(e) => setDesireIntensity(parseFloat(e.target.value))}
                        disabled={isSubmitting}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                        <span>Intense</span>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div>
                      <label htmlFor="desire-status" className="block text-sm text-gray-300 mb-2">
                        Where is this desire in its journey?
                      </label>
                      <select
                        id="desire-status"
                        value={desireStatus}
                        onChange={(e) => setDesireStatus(e.target.value as 'nascent' | 'active' | 'fulfilled')}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="nascent">Nascent - Just discovered this want</option>
                        <option value="active">Active - Actively pursuing this</option>
                        <option value="fulfilled">Fulfilled - Already achieved</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Tags for Mind */}
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
              </>
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
