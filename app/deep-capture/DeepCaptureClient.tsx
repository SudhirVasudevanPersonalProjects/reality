'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { transcribeAudio, isAudioFile } from '@/lib/transcription/whisper'
import { fetchLinkMetadata, isValidUrl } from '@/lib/link-preview/fetch-metadata'
import { createClient } from '@/lib/supabase/client'

interface ProcessedItem {
  id: string
  type: 'text' | 'photo' | 'video' | 'audio' | 'link'
  content: string
  file?: File
  mediaUrl?: string
  linkPreview?: { title?: string; description?: string; image?: string; url: string }
  processing: boolean
  error?: string
}

export default function DeepCaptureClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [textInput, setTextInput] = useState('')
  const [textSplits, setTextSplits] = useState<string[]>([])
  const [packagedItems, setPackagedItems] = useState<ProcessedItem[]>([])
  const [linkInput, setLinkInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const supabase = createClient()

  // Pre-populate text from query param on mount
  useEffect(() => {
    const textParam = searchParams?.get('text')
    if (textParam) {
      setTextInput(textParam)
      // Auto-split if contains newlines
      if (textParam.includes('\n')) {
        const splits = textParam.split('\n').filter(s => s.trim())
        setTextSplits(splits)
      }
    }
  }, [searchParams])

  // Update text splits when text input changes
  const handleTextChange = (value: string) => {
    setTextInput(value)

    // Auto-split on newlines
    if (value.includes('\n')) {
      const splits = value.split('\n').filter(s => s.trim())
      setTextSplits(splits)
    } else {
      // Single line
      if (value.trim()) {
        setTextSplits([value.trim()])
      } else {
        setTextSplits([])
      }
    }
  }

  // Update a specific split
  const updateSplit = (index: number, value: string) => {
    setTextSplits(prev => prev.map((split, i) => i === index ? value : split))
  }

  // Delete a split
  const deleteSplit = (index: number) => {
    setTextSplits(prev => prev.filter((_, i) => i !== index))
  }

  // Auto-clean empty splits
  useEffect(() => {
    const hasEmptySplits = textSplits.some(split => !split.trim())
    if (hasEmptySplits) {
      setTextSplits(prev => prev.filter(split => split.trim()))
    }
  }, [textSplits])

  // Merge split with the one above it
  const mergeSplitUp = (index: number) => {
    if (index === 0) return // Can't merge top item
    setTextSplits(prev => {
      const newSplits = [...prev]
      newSplits[index - 1] = newSplits[index - 1] + '\n' + newSplits[index]
      newSplits.splice(index, 1)
      return newSplits
    })
  }

  // Add text splits to package
  const addToPackage = () => {
    if (textSplits.length === 0) return

    const textItems: ProcessedItem[] = textSplits.map((split, index) => ({
      id: `text-${Date.now()}-${index}`,
      type: 'text',
      content: split,
      processing: false,
    }))

    setPackagedItems(prev => [...prev, ...textItems])
    setTextSplits([])
    setTextInput('')
  }

  // Handle file upload (from input or drag-drop)
  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const fileId = `file-${Date.now()}-${Math.random()}`

      // Determine file type and process accordingly
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        // Images and videos - create preview URL for client-side display
        const previewUrl = URL.createObjectURL(file)
        const newItem: ProcessedItem = {
          id: fileId,
          type: file.type.startsWith('video/') ? 'video' : 'photo',
          content: '',
          file, // Keep the file object
          mediaUrl: previewUrl, // Client-side preview URL
          processing: false,
        }
        setPackagedItems(prev => [...prev, newItem])
      } else if (isAudioFile(file)) {
        // Audio files - just upload, no transcription
        const newItem: ProcessedItem = {
          id: fileId,
          type: 'audio',
          content: '',
          file,
          processing: false,
        }
        setPackagedItems(prev => [...prev, newItem])
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await handleFiles(files)
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await handleFiles(files)
    }
  }

  // Handle link input
  const handleAddLink = async () => {
    if (!linkInput.trim()) return

    if (!isValidUrl(linkInput)) {
      setError('Please enter a valid URL')
      return
    }

    setError(null)
    const linkId = `link-${Date.now()}`
    const newItem: ProcessedItem = {
      id: linkId,
      type: 'link',
      content: linkInput,
      processing: true,
    }
    setPackagedItems(prev => [...prev, newItem])

    try {
      const metadata = await fetchLinkMetadata(linkInput)
      setPackagedItems(prev => prev.map(item =>
        item.id === linkId
          ? { ...item, linkPreview: metadata, processing: false }
          : item
      ))
      setLinkInput('') // Clear input after successful add
    } catch (err) {
      setPackagedItems(prev => prev.map(item =>
        item.id === linkId
          ? { ...item, processing: false, linkPreview: { url: linkInput } }
          : item
      ))
    }
  }

  // Update packaged item content
  const updateItemContent = (id: string, content: string) => {
    setPackagedItems(prev => prev.map(item =>
      item.id === id ? { ...item, content } : item
    ))
  }

  // Delete packaged item
  const deleteItem = (id: string) => {
    setPackagedItems(prev => prev.filter(item => item.id !== id))
  }

  // Auto-clean empty text items
  useEffect(() => {
    const hasEmptyTextItems = packagedItems.some(item =>
      item.type === 'text' && !item.content.trim() && !item.processing
    )
    if (hasEmptyTextItems) {
      setPackagedItems(prev => prev.filter(item =>
        item.type !== 'text' || item.content.trim() || item.processing
      ))
    }
  }, [packagedItems])


// Handle rocket ship send
const handleSend = async () => {
  // Validate at least 1 something to submit
  const validItems = packagedItems.filter(item => !item.processing && !item.error)
  if (validItems.length === 0) {
    setError('Please add some text or upload files before sending')
    return
  }

  setError(null)
  setIsSubmitting(true)

  try {
    // Group items: text/links go together, media files go together
    const textAndLinks = validItems.filter(item => item.type === 'text' || item.type === 'link')
    const fileItems = validItems.filter(item => item.type === 'photo' || item.type === 'video' || item.type === 'audio')

    const submissions: Promise<Response>[] = []

    // Submit text items
    for (const item of textAndLinks) {
      const formData = new FormData()

      if (item.type === 'link') {
        formData.append('text_content', item.content)
        if (item.linkPreview) {
          formData.append('attributes', JSON.stringify({ link_preview: item.linkPreview }))
        }
      } else {
        formData.append('text_content', item.content)
      }

      submissions.push(fetch('/api/somethings', {
        method: 'POST',
        body: formData
      }))
    }

    // Submit files **one at a time** (instead of batching)
    for (const item of fileItems) {
      if (!item.file) continue
      const fileFormData = new FormData()
      fileFormData.append('files', item.file)

      submissions.push(fetch('/api/somethings', {
        method: 'POST',
        body: fileFormData
      }))
    }

    // Wait for all submissions
    const results = await Promise.all(submissions)
    const failures = results.filter(r => !r.ok)

    if (failures.length > 0) {
      // Log the error details for debugging
      for (const failure of failures) {
        const errorText = await failure.text()
        console.error('Submission failed:', failure.status, errorText)
      }
      throw new Error(`${failures.length} items failed to submit`)
    }

    // Start rocket animation
    setIsAnimating(true)

    // Wait for rocket animation (1 second) THEN navigate
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Clear Live-Capture localStorage before navigating
    localStorage.removeItem('liveCaptureText')

    // Navigate back to Live-Capture - this should happen smoothly after animation
    router.push('/capture')
  } catch (err) {
    console.error('Failed to submit somethings:', err)
    setError('Failed to submit. Please try again.')
    setIsSubmitting(false)
    setIsAnimating(false)
  }
}

  const totalCount = packagedItems.filter(i => !i.processing && !i.error).length

  return (
    <div className="min-h-screen bg-[#f5f5dc] text-gray-900 flex flex-col">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Text Input */}
          <div>
            <textarea
              className="w-full min-h-[200px] p-4 text-lg bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 resize-none shadow-sm"
              placeholder="Type or paste your text here..."
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Auto-Split Preview */}
          {textSplits.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {textSplits.length} split{textSplits.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={addToPackage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium"
                  disabled={isSubmitting || textSplits.length === 0}
                >
                  Add to Package
                </button>
              </div>

              <div className="space-y-3">
                {textSplits.map((split, index) => (
                  <div
                    key={index}
                    className="relative p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm"
                  >
                    {index > 0 && (
                      <button
                        onClick={() => mergeSplitUp(index)}
                        className="absolute top-2 right-10 text-gray-500 hover:text-gray-700 text-xl"
                        disabled={isSubmitting}
                        aria-label="Merge up"
                        title="Merge with above"
                      >
                        ↑
                      </button>
                    )}
                    <button
                      onClick={() => deleteSplit(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                      disabled={isSubmitting}
                      aria-label="Delete"
                    >
                      ×
                    </button>
                    <textarea
                      className="w-full min-h-[60px] text-base bg-transparent border-none focus:outline-none resize-none pr-16"
                      value={split}
                      onChange={(e) => updateSplit(index, e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Interface */}
          <div>
            <label className="block">
              <div
                className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all bg-white shadow-sm ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-400 hover:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,video/*,audio/*,.m4a,.mp3,.wav,.aac,.ogg,.flac"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                />
                <p className="text-gray-700 font-medium">
                  {isDragging ? 'Drop files here' : 'Click to upload files or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Photos, videos, audio
                </p>
              </div>
            </label>
          </div>

          {/* Link Input */}
          <div>
            <div className="flex gap-2">
              <input
                type="url"
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 bg-white shadow-sm"
                placeholder="Paste a link (Instagram, TikTok, YouTube, etc.)"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                disabled={isSubmitting}
              />
              <button
                onClick={handleAddLink}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium"
                disabled={isSubmitting || !linkInput.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Packaged Items (Ready to Send) */}
          {packagedItems.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {totalCount} something{totalCount !== 1 ? 's' : ''} ready to upload
              </p>

              <div className="space-y-3">
                {packagedItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm"
                  >
                    {item.processing && (
                      <div className="text-sm text-blue-600">Processing...</div>
                    )}

                    {item.error && (
                      <div className="text-sm text-red-600">{item.error}</div>
                    )}

                    {!item.processing && !item.error && (
                      <>
                        {item.type === 'text' && (
                          <div>
                            <textarea
                              className="w-full min-h-[60px] text-base bg-transparent border-none focus:outline-none resize-none pr-8"
                              value={item.content}
                              onChange={(e) => updateItemContent(item.id, e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                        )}

                        {item.type === 'photo' && item.mediaUrl && (
                          <div>
                            <img
                              src={item.mediaUrl}
                              alt="Photo preview"
                              className="w-full max-h-64 object-contain rounded"
                            />
                          </div>
                        )}

                        {item.type === 'video' && item.mediaUrl && (
                          <div>
                            <video
                              src={item.mediaUrl}
                              className="w-full max-h-64 rounded"
                              controls
                            />
                          </div>
                        )}

                        {item.type === 'audio' && item.file && (
                          <div>
                            <div className="text-sm text-gray-700">
                              Audio file ready
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          </div>
                        )}

                        {item.type === 'link' && item.linkPreview && (
                          <div>
                            {item.linkPreview.image && (
                              <img
                                src={item.linkPreview.image}
                                alt="Link preview"
                                className="w-full max-h-48 object-cover rounded mb-2"
                              />
                            )}
                            <a
                              href={item.linkPreview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm italic underline text-black hover:text-gray-700 block"
                            >
                              {item.linkPreview.url}
                            </a>
                          </div>
                        )}

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                          disabled={isSubmitting}
                          aria-label="Delete"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Send Buttons (Fixed bottom right) */}
      <div className="fixed bottom-4 right-8 flex flex-col items-center gap-1">
        {/* Rocket Ship Button */}
        <button
          onClick={handleSend}
          disabled={isSubmitting || totalCount === 0}
          className={`w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition-all duration-300 ${
            isAnimating ? 'animate-rocket-fly' : ''
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Send"
        >
          🚀
        </button>

        {/* Send Text */}
        <button
          onClick={handleSend}
          disabled={isSubmitting || totalCount === 0}
          className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
        >
          SEND PACKAGE
        </button>
      </div>

      <style jsx>{`
        @keyframes rocket-fly {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(500px, -500px) rotate(-45deg);
            opacity: 0;
          }
        }

        .animate-rocket-fly {
          animation: rocket-fly 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
