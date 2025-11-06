'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'

type Capture = Database['public']['Tables']['somethings']['Row']

interface DashboardClientProps {
  user: User
  captures: Capture[]
  unorganizedCount: number
}

export default function DashboardClient({ user, captures, unorganizedCount }: DashboardClientProps) {
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
                href="/my_reality"
                className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition"
              >
                My Reality
              </Link>
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

        {/* Gemstone Button - Enter the Chamber */}
        {unorganizedCount > 0 && (
          <div className="mb-12 flex flex-col items-center justify-center w-full">
            <Link
              href="/chamber"
              prefetch={false}
              className="group relative px-12 py-6 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-purple-900/50 transition-all duration-300 hover:scale-105 border-2 border-purple-700/50 overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, #a78bfa 0%, #7c3aed 25%, #6d28d9 40%, #5b21b6 60%, #4c1d95 80%, #2e1065 100%)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.5), inset 0 -10px 30px rgba(139, 92, 246, 0.3), inset 0 10px 20px rgba(167, 139, 250, 0.2)',
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="font-serif tracking-wide text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  Enter the Chamber of Reflection
                </span>
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <p className="mt-4 text-gray-300 text-lg font-bold">
              {unorganizedCount}+ unorganized
            </p>
          </div>
        )}

        {/* Divider between Chamber section and organized content */}
        {unorganizedCount > 0 && captures.length > 0 && (
          <div className="mb-8 border-t border-gray-800" />
        )}

        {/* Empty State - No captures at all */}
        {captures.length === 0 && unorganizedCount === 0 ? (
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
        ) : captures.length === 0 && unorganizedCount > 0 ? (
          /* No organized captures yet, but unorganized exist - prompt to organize */
          <div className="text-center py-16">
            <div className="mb-6">
              <p className="text-xl text-gray-400 mb-2">No organized content yet</p>
              <p className="text-sm text-gray-500">
                You have {unorganizedCount} unorganized capture{unorganizedCount !== 1 ? 's' : ''}.
                <br />
                Enter the Chamber to organize them and see your reality take shape.
              </p>
            </div>
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
                  <span suppressHydrationWarning>
                    {formatTimestamp(capture.created_at)}
                  </span>
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
