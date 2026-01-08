import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SomethingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch something by ID
  const { data: something, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !something) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
        <Link
          href="/my-reality/physical-abode"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          Back to Map
        </Link>
      </div>
    )
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Render care stars
  const renderCareStars = (care: number | null) => {
    if (!care) return <span className="text-gray-500">No rating</span>

    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= care ? 'text-yellow-400' : 'text-gray-600'}>
          ★
        </span>
      )
    }
    return <span className="text-2xl">{stars}</span>
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Header with back button */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/my-reality/physical-abode"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Map
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Realm badge */}
        {something.realm && (
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                something.realm === 'physical'
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-purple-900 text-purple-300'
              }`}
            >
              {something.realm === 'physical' ? 'Physical' : 'Mind'}
            </span>
          </div>
        )}

        {/* Location */}
        {something.location_name && (
          <h1 className="text-3xl font-bold mb-2">{something.location_name}</h1>
        )}

        {/* Formatted address */}
        {something.formatted_address && (
          <p className="text-gray-400 mb-4">{something.formatted_address}</p>
        )}

        {/* Timestamp */}
        <p className="text-gray-500 text-sm mb-6">
          <span suppressHydrationWarning>
            {formatTimestamp(something.captured_at)}
          </span>
        </p>

        {/* Care rating */}
        {something.care && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Care Rating</h2>
            {renderCareStars(something.care)}
          </div>
        )}

        {/* Text content */}
        {something.text_content && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Notes</h2>
            <p className="text-white text-lg whitespace-pre-wrap">
              {something.text_content}
            </p>
          </div>
        )}

        {/* Media */}
        {something.media_url && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Media</h2>
            {something.content_type === 'photo' && (
              <img
                src={something.media_url}
                alt="Experience media"
                className="rounded-lg w-full h-auto object-contain"
              />
            )}
            {something.content_type === 'video' && (
              <video
                src={something.media_url}
                controls
                className="rounded-lg w-full h-auto object-contain"
              />
            )}
            {something.content_type === 'link' && (
              <a
                href={something.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {something.media_url}
              </a>
            )}
          </div>
        )}

        {/* Coordinates */}
        {something.latitude && something.longitude && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Coordinates</h2>
            <p className="text-gray-300 font-mono text-sm">
              {something.latitude.toFixed(6)}, {something.longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-8 text-xs text-gray-600">
          <p>ID: {something.id}</p>
          <p suppressHydrationWarning>Created: {new Date(something.created_at || '').toLocaleString()}</p>
          {something.updated_at && (
            <p suppressHydrationWarning>Updated: {new Date(something.updated_at).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}
