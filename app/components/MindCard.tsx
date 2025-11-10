'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface MindCardProps {
  something: any
  connectionCount: number
  dependencies: any[] | null
  previousId: string | null
  nextId: string | null
}

export function MindCard({ something, connectionCount, dependencies, previousId, nextId }: MindCardProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Extract attributes
  const attributes = something.attributes as any || {}
  const mindCategory = attributes.mind_category || 'thought'
  const why = attributes.why
  const sunDomain = attributes.sun_domain || 'somewhere'
  const desireIntensity = attributes.desire_intensity
  const desireStatus = attributes.desire_status

  // Category badge configuration
  const categoryConfig = {
    experience: {
      icon: '🎭',
      label: 'EXPERIENCE',
      subtitle: 'Past Memory',
    },
    thought: {
      icon: '💭',
      label: 'THOUGHT',
      subtitle: 'Reflection',
    },
    desire: {
      icon: '✨',
      label: 'DESIRE',
      subtitle: 'Future Aspiration',
    },
  }

  const category = categoryConfig[mindCategory as keyof typeof categoryConfig] || categoryConfig.thought

  // Care rating configuration
  const careLabels = ['Hate', 'Dislike', 'Neutral', 'Like', 'Love']
  const careLabel = something.care ? careLabels[something.care - 1] : 'Not rated'
  const careStars = something.care ? '★'.repeat(something.care) + '☆'.repeat(5 - something.care) : '☆☆☆☆☆'

  // Calculate brightness based on care
  const brightness = something.care ? (something.care - 1) / 4 : 0.5

  // Parse media URLs
  const mediaUrls = something.media_url ? (Array.isArray(something.media_url) ? something.media_url : [something.media_url]) : []

  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Sun domain configuration
  const sunConfig: Record<string, { icon: string; label: string }> = {
    somewhere: { icon: '🗑️', label: 'Somewhere' },
    beauty: { icon: '☀️', label: 'Beauty' },
    ugly: { icon: '🌑', label: 'Ugly' },
    dreams: { icon: '💫', label: 'Dreams' },
  }

  const sunInfo = sunConfig[sunDomain] || sunConfig.somewhere

  // Intensity labels
  const getIntensityLabel = (intensity: number) => {
    if (intensity < 0.3) return 'Mild'
    if (intensity < 0.6) return 'Moderate'
    if (intensity < 0.85) return 'Strong'
    return 'Intense'
  }

  // Status badges
  const statusConfig: Record<string, { color: string; label: string }> = {
    nascent: { color: 'text-gray-400', label: 'Nascent' },
    active: { color: 'text-blue-400', label: 'Active' },
    fulfilled: { color: 'text-green-400', label: 'Fulfilled' },
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('somethings')
        .delete()
        .eq('id', something.id)

      if (error) throw error

      router.push('/mind')
      router.refresh()
    } catch (error) {
      console.error('Error deleting something:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-void text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Pokémon Card Container */}
        <div
          className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-4 border-gray-700"
          style={{ opacity: 0.4 + (brightness * 0.6) }}
        >
          {/* Top Section: Category Badge */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-6 rounded-t-xl border-b-4 border-gray-700">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-4xl">{category.icon}</span>
              <div className="text-center">
                <div className="text-2xl font-bold tracking-wider">{category.label}</div>
                <div className="text-sm text-purple-200">{category.subtitle}</div>
              </div>
            </div>
          </div>

          {/* Middle Section: Content Display */}
          <div className="p-8">
            {/* Text Content */}
            {something.text_content && (
              <div className="mb-6 text-lg leading-relaxed whitespace-pre-wrap">
                {something.text_content}
              </div>
            )}

            {/* Media Gallery (Slideshow if multiple) */}
            {mediaUrls.length > 0 && (
              <div className="mb-6">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <Image
                    src={mediaUrls[currentMediaIndex]}
                    alt="Mind something media"
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  {mediaUrls.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
                      <button
                        onClick={() => setCurrentMediaIndex((currentMediaIndex - 1 + mediaUrls.length) % mediaUrls.length)}
                        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
                      >
                        ←
                      </button>
                      <span className="text-sm">{currentMediaIndex + 1} / {mediaUrls.length}</span>
                      <button
                        onClick={() => setCurrentMediaIndex((currentMediaIndex + 1) % mediaUrls.length)}
                        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* "Why This Matters" Section */}
            {why && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">Why this matters:</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{why}</p>
              </div>
            )}

            {/* Empty State */}
            {!something.text_content && mediaUrls.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No content recorded
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t-4 border-gray-700 mx-8"></div>
          <div className="text-center py-2">
            <span className="text-xs font-bold tracking-widest text-gray-500">ATTRIBUTES</span>
          </div>
          <div className="border-t-4 border-gray-700 mx-8"></div>

          {/* Bottom Section: Attributes Panel */}
          <div className="p-8 space-y-4">
            {/* Time */}
            <div className="flex items-start">
              <span className="text-xl mr-3">🕐</span>
              <div>
                <span className="font-semibold">Time:</span> {formatDate(something.captured_at)}
              </div>
            </div>

            {/* Care Rating */}
            {something.care && (
              <div className="flex items-start">
                <span className="text-xl mr-3">❤️</span>
                <div>
                  <span className="font-semibold">Care:</span> {careStars} ({careLabel})
                </div>
              </div>
            )}

            {/* Physical Location */}
            {something.location_name && (
              <div className="flex items-start">
                <span className="text-xl mr-3">📍</span>
                <div>
                  <div className="font-semibold">Location: {something.location_name}</div>
                  {something.latitude && something.longitude && (
                    <>
                      <div className="text-sm text-gray-400">
                        {something.latitude.toFixed(4)}°N, {Math.abs(something.longitude).toFixed(4)}°{something.longitude >= 0 ? 'E' : 'W'}
                      </div>
                      <Link
                        href={`/my_reality?lat=${something.latitude}&lng=${something.longitude}&zoom=15`}
                        className="inline-block mt-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                      >
                        View on Map
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {!something.location_name && (
              <div className="flex items-start">
                <span className="text-xl mr-3">📍</span>
                <div className="text-gray-500">No physical location linked</div>
              </div>
            )}

            {/* Sun/Domain */}
            <div className="flex items-start">
              <span className="text-xl mr-3">{sunInfo.icon}</span>
              <div>
                <span className="font-semibold">Domain:</span> {sunInfo.label}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start">
              <span className="text-xl mr-3">🏷️</span>
              <div>
                <span className="font-semibold">Tags:</span> <span className="text-gray-500">Coming soon</span>
              </div>
            </div>

            {/* Connections */}
            <div className="flex items-start">
              <span className="text-xl mr-3">🔗</span>
              <div>
                <span className="font-semibold">Connections:</span>{' '}
                {connectionCount > 0 ? `${connectionCount} connection${connectionCount !== 1 ? 's' : ''}` : 'No connections yet'}
              </div>
            </div>

            {/* Desire-Specific Attributes */}
            {mindCategory === 'desire' && (
              <>
                {/* Intensity Bar */}
                {desireIntensity !== undefined && desireIntensity !== null && (
                  <div className="flex items-start">
                    <span className="text-xl mr-3">🔥</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Intensity: {getIntensityLabel(desireIntensity)}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all"
                            style={{ width: `${desireIntensity * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">{desireIntensity.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                {desireStatus && (
                  <div className="flex items-start">
                    <span className="text-xl mr-3">✅</span>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={statusConfig[desireStatus]?.color || 'text-gray-400'}>
                        {statusConfig[desireStatus]?.label || desireStatus}
                      </span>
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {dependencies && dependencies.length > 0 && (
                  <div className="flex items-start">
                    <span className="text-xl mr-3">📋</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-2">Depends on:</div>
                      <ul className="space-y-2">
                        {dependencies.map((dep: any) => {
                          const depSomething = dep.somethings
                          const depStatus = depSomething?.attributes?.desire_status
                          const isFulfilled = depStatus === 'fulfilled'
                          return (
                            <li key={dep.to_something_id} className="flex items-start space-x-2">
                              <span className="text-lg">{isFulfilled ? '✓' : '⏳'}</span>
                              <Link
                                href={`/mind/${dep.to_something_id}`}
                                className="flex-1 hover:text-purple-400 underline"
                              >
                                {depSomething?.text_content?.substring(0, 60) || 'Untitled'}
                                {depSomething?.text_content && depSomething.text_content.length > 60 ? '...' : ''}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-8 pt-4 flex flex-wrap gap-3 justify-center border-t-4 border-gray-700">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Back
            </button>
            <Link
              href={`/mind/${something.id}/edit`}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold"
            >
              Delete
            </button>
          </div>

          {/* Previous/Next Navigation */}
          {(previousId || nextId) && (
            <div className="p-8 pt-0 flex justify-between">
              {previousId ? (
                <Link
                  href={`/mind/${previousId}`}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg"
                >
                  ← Previous
                </Link>
              ) : (
                <div></div>
              )}
              {nextId ? (
                <Link
                  href={`/mind/${nextId}`}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg"
                >
                  Next →
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
