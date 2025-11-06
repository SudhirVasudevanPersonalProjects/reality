'use client'

import { useState, useEffect } from 'react'
import { SplitModalProps, SuggestedSplit } from '@/lib/types/split'

export default function SplitModal({ something, onComplete, onCancel }: SplitModalProps) {
  const [splits, setSplits] = useState<SuggestedSplit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-detect and suggest splits on mount
  useEffect(() => {
    const suggestedSplits = generateSuggestedSplits()
    setSplits(suggestedSplits)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateSuggestedSplits = (): SuggestedSplit[] => {
    const suggested: SuggestedSplit[] = []

    // If text has newlines, suggest splitting by newlines
    if (something.text_content && something.text_content.includes('\n')) {
      const textLines = something.text_content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      textLines.forEach((line, index) => {
        suggested.push({
          text_content: line,
          media_urls: index === 0 && something.media_url ? [something.media_url] : []
        })
      })
    } else if (something.text_content) {
      // Single text, no split suggestion
      suggested.push({
        text_content: something.text_content,
        media_urls: something.media_url ? [something.media_url] : []
      })
    }

    // If only media (no text), create single split with media
    if (!something.text_content && something.media_url) {
      suggested.push({
        text_content: `[${something.content_type}]`,
        media_urls: [something.media_url]
      })
    }

    return suggested.length > 0 ? suggested : [{
      text_content: something.text_content || '',
      media_urls: something.media_url ? [something.media_url] : []
    }]
  }

  const handleTextChange = (index: number, newText: string) => {
    const updated = [...splits]
    updated[index].text_content = newText
    setSplits(updated)
  }

  const handleAddSplit = () => {
    setSplits([...splits, { text_content: '', media_urls: [] }])
  }

  const handleRemoveSplit = (index: number) => {
    if (splits.length <= 1) {
      setError('Cannot remove last split. Use Cancel to exit.')
      return
    }
    setSplits(splits.filter((_, i) => i !== index))
    setError(null)
  }

  const handleMergeUp = (index: number) => {
    if (index === 0) return // Can't merge up from first item

    const updated = [...splits]
    // Merge current into previous
    updated[index - 1].text_content = updated[index - 1].text_content + '\n' + updated[index].text_content
    // Combine media URLs (deduplicate)
    const combinedUrls = [...updated[index - 1].media_urls, ...updated[index].media_urls]
    updated[index - 1].media_urls = Array.from(new Set(combinedUrls))
    // Remove current
    updated.splice(index, 1)

    setSplits(updated)
    setError(null)
  }

  const handleMergeDown = (index: number) => {
    if (index >= splits.length - 1) return // Can't merge down from last item

    const updated = [...splits]
    // Merge next into current
    updated[index].text_content = updated[index].text_content + '\n' + updated[index + 1].text_content
    // Combine media URLs (deduplicate)
    const combinedUrls = [...updated[index].media_urls, ...updated[index + 1].media_urls]
    updated[index].media_urls = Array.from(new Set(combinedUrls))
    // Remove next
    updated.splice(index + 1, 1)

    setSplits(updated)
    setError(null)
  }

  const handleMediaToggle = (splitIndex: number, mediaUrl: string) => {
    const updated = [...splits]
    const currentMedia = updated[splitIndex].media_urls

    if (currentMedia.includes(mediaUrl)) {
      // Remove media from this split
      updated[splitIndex].media_urls = currentMedia.filter(url => url !== mediaUrl)
    } else {
      // Add media to this split
      updated[splitIndex].media_urls = [...currentMedia, mediaUrl]
    }

    setSplits(updated)
  }

  const handleConfirmSplit = async () => {
    setLoading(true)
    setError(null)

    // Validate splits
    const validSplits = splits.filter(split => split.text_content.trim().length > 0)
    if (validSplits.length === 0) {
      setError('At least one split must have text content')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/somethings/${something.id}/split`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          splits: validSplits.map(split => ({
            text_content: split.text_content.trim(),
            media_urls: split.media_urls.length > 0 ? split.media_urls : undefined
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to split')
      }

      // Pass first child ID to show it immediately after split
      const firstChildId = data.splits && data.splits.length > 0 ? data.splits[0].id : undefined
      onComplete(firstChildId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <h2 className="text-2xl font-bold">Split This Capture</h2>
          <p className="text-sm text-gray-400 mt-2">
            Adjust the splits below. Each split will become a separate something.
          </p>
        </div>

        {/* Splits Editor */}
        <div className="p-6 space-y-6">
          {splits.map((split, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-400">Split {index + 1}</h3>
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => handleMergeUp(index)}
                      className="text-xs px-2 py-1 border border-gray-600 hover:bg-gray-800 rounded transition"
                      title="Merge with split above"
                    >
                      Merge ↑
                    </button>
                  )}
                  {index < splits.length - 1 && (
                    <button
                      onClick={() => handleMergeDown(index)}
                      className="text-xs px-2 py-1 border border-gray-600 hover:bg-gray-800 rounded transition"
                      title="Merge with split below"
                    >
                      Merge ↓
                    </button>
                  )}
                  {splits.length > 1 && (
                    <button
                      onClick={() => handleRemoveSplit(index)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Text Editor */}
              <textarea
                value={split.text_content}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder="Enter text for this split..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 mb-3"
                rows={3}
              />

              {/* Media Assignment (if original has media) */}
              {something.media_url && (
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={split.media_urls.includes(something.media_url)}
                      onChange={() => handleMediaToggle(index, something.media_url!)}
                      className="w-4 h-4"
                    />
                    <span>Include media in this split</span>
                  </label>
                  {split.media_urls.includes(something.media_url) && (
                    <div className="mt-2">
                      <img
                        src={something.media_url}
                        alt="Media preview"
                        className="w-20 h-20 object-cover rounded border border-gray-700"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Split Button */}
          <button
            onClick={handleAddSplit}
            className="w-full py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition text-sm"
          >
            + Add Another Split
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-900/20 border border-red-800 rounded-md p-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="border-t border-gray-800 p-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSplit}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Splitting...' : 'Confirm Split'}
          </button>
        </div>
      </div>
    </div>
  )
}
