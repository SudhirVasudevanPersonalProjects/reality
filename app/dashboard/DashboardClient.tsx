'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'

type Capture = Database['public']['Tables']['captures']['Row']

interface DashboardClientProps {
  user: User
  captures: Capture[]
}

export default function DashboardClient({ user, captures }: DashboardClientProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Render text with URLs as clickable links
  const renderTextWithLinks = (text: string) => {
    // Regex to match URLs in text (http/https or bare domains like google.com)
    const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[\w\-]+\.[\w\-]+(?:\.[\w\-]+)*(?:\/[^\s]*)?)/gi
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      // Check if this part is a URL
      if (part.match(urlRegex)) {
        const url = part.startsWith('http://') || part.startsWith('https://')
          ? part
          : `https://${part}`

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {part}
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-bold">Reality</h2>
            <div className="flex items-center space-x-4">
              <Link
                href="/capture"
                className="px-4 py-2 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition font-semibold"
              >
                + Add to Your Reality
              </Link>
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">my reality</h1>

        {/* Empty State */}
        {captures.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <p className="text-xl text-gray-400 mb-2">No captures yet</p>
              <p className="text-sm text-gray-500">Start capturing your reality!</p>
            </div>
            <Link
              href="/capture"
              className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              + Create Your First Capture
            </Link>
          </div>
        ) : (
          /* Captures Timeline */
          <div className="space-y-6">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="border border-gray-800 rounded-lg p-6 bg-gray-900/50 hover:border-gray-700 transition"
              >
                {/* Timestamp */}
                <div className="text-xs text-gray-500 mb-3">
                  {formatTimestamp(capture.created_at)}
                </div>

                {/* Content based on type */}
                {capture.content_type === 'text' && capture.text_content && (
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {renderTextWithLinks(capture.text_content)}
                  </div>
                )}

                {capture.content_type === 'photo' && capture.media_url && (
                  <div>
                    <img
                      src={capture.media_url}
                      alt={`Photo capture from ${formatTimestamp(capture.created_at)}`}
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}

                {capture.content_type === 'video' && capture.media_url && (
                  <div>
                    <video
                      src={capture.media_url}
                      controls
                      className="rounded-lg max-w-full h-auto"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Note: 'url' type captures are filtered out at the database level */}
                {/* They're stored for future querying but not displayed on main dashboard */}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button (Alternative/Additional to navbar button) */}
      <Link
        href="/capture"
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-200 transition shadow-lg"
        title="Add to Your Reality"
      >
        +
      </Link>
    </div>
  )
}
