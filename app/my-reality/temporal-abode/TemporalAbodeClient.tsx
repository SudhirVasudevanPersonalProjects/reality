'use client'

import { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'
import Image from 'next/image'

type Something = Database['public']['Tables']['somethings']['Row']

interface TemporalAbodeClientProps {
  somethings: Something[]
}

export default function TemporalAbodeClient({ somethings }: TemporalAbodeClientProps) {
  // Group somethings by date
  const groupedByDate = somethings.reduce((groups, something) => {
    const date = new Date(something.captured_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(something)
    return groups
  }, {} as Record<string, Something[]>)

  const renderThumbnail = (something: Something) => {
    if (something.content_type === 'photo' && something.media_url) {
      return (
        <Image
          src={something.media_url}
          alt="Capture"
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded"
        />
      )
    }
    if (something.content_type === 'video') {
      return (
        <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
      )
    }
    if (something.content_type === 'url') {
      return (
        <div className="w-12 h-12 bg-blue-900/50 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </div>
      )
    }
    // Text
    return (
      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </div>
    )
  }

  const getPreviewText = (something: Something) => {
    if (something.text_content) {
      return something.text_content.substring(0, 100) + (something.text_content.length > 100 ? '...' : '')
    }
    if (something.content_type === 'photo') return 'Photo'
    if (something.content_type === 'video') return 'Video'
    if (something.content_type === 'url') return 'Link'
    return 'Capture'
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a1628] overflow-hidden">
      {/* Header */}
      <nav className="bg-black/50 border-b border-gray-800 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-bold text-white">Temporal Abode</h2>
            <Link
              href="/dashboard"
              prefetch={false}
              className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Horizontal Timeline */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden px-4">
        {somethings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🕰️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No captures yet</h3>
            <p className="text-gray-400">Your timeline will appear here once you start capturing.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Horizontal timeline line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700 -translate-y-1/2" />

            {/* Horizontal scrolling container */}
            <div className="overflow-x-auto pb-4 pt-4">
              <div className="flex gap-6 px-4 min-w-min">
                {Object.entries(groupedByDate).map(([date, items]) => (
                  <div key={date} className="flex flex-col items-center flex-shrink-0">
                    {/* Date marker dot */}
                    <div className="w-3 h-3 bg-white rounded-full mb-2 relative z-10" />

                    {/* Date label */}
                    <h3 className="text-white font-semibold text-xs text-center whitespace-nowrap mb-3">
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>

                    {/* Items for this date - stacked vertically below the timeline */}
                    <div className="flex flex-col gap-2">
                      {items.map((something) => (
                        <div
                          key={something.id}
                          className="bg-black/30 rounded-lg p-2 flex flex-col items-center gap-2 hover:bg-black/50 transition w-24"
                        >
                          {renderThumbnail(something)}
                          <div className="text-center">
                            <p className="text-gray-500 text-xs">
                              {new Date(something.captured_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                            {something.latitude && something.longitude && (
                              <p className="text-gray-600 text-xs">📍</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
