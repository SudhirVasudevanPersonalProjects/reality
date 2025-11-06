'use client'

import { useState, useRef, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SelectedFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function CapturePage() {
  const router = useRouter()
  const [textContent, setTextContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
    }
  }, [selectedFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: SelectedFile[] = []

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError(`Invalid file type: ${file.name}`)
        return
      }

      // Validate file size
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds size limit`)
        return
      }

      const preview = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      newFiles.push({ file, preview, type })
    })

    setSelectedFiles((prev) => [...prev, ...newFiles])
    setError(null)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview) // Clean up preview URL
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!textContent.trim() && selectedFiles.length === 0) {
      setError('Please enter text or select files to capture')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setWarning(null)

    try {
      const formData = new FormData()

      if (textContent.trim()) {
        formData.append('text_content', textContent.trim())
      }

      selectedFiles.forEach((selectedFile) => {
        formData.append('files', selectedFile.file)
      })

      const response = await fetch('/api/captures', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create capture')
      }

      // Check for partial success (some files failed)
      if (data.failedFiles && data.failedFiles.length > 0) {
        setWarning(`Some files could not be uploaded: ${data.failedFiles.join(', ')}`)
      }

      // Clear form
      setTextContent('')
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Show success message and stay on page for more captures
      setShowSuccess(true)

      // Auto-hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error('Error creating capture:', err)
      setError(err instanceof Error ? err.message : 'Failed to create capture')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" prefetch={false} className="text-xl font-bold hover:text-gray-300 transition">
              Reality
            </Link>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Add to Your Reality</h1>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-center">
            ✓ Captured! Add more or navigate away.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-center">
            ⚠️ {warning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview Area */}
          {selectedFiles.length > 0 && (
            <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400">
                  Selected Files ({selectedFiles.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedFiles.map((selectedFile, index) => (
                  <div key={index} className="relative group">
                    {selectedFile.type === 'image' ? (
                      <img
                        src={selectedFile.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-700"
                      />
                    ) : (
                      <video
                        src={selectedFile.preview}
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-700"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                      {selectedFile.file.name.length > 15
                        ? selectedFile.file.name.slice(0, 12) + '...'
                        : selectedFile.file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - GPT-like */}
          <div className="border border-gray-800 rounded-lg bg-gray-900/50 focus-within:border-gray-700 transition">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Type or paste your thoughts, experiences, or URLs..."
              className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-[120px]"
              disabled={isSubmitting}
            />

            {/* Bottom Bar with Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                {/* File Attachment Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="file-input"
                  className={`cursor-pointer p-2 hover:bg-gray-800 rounded-lg transition ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Attach files"
                  aria-label="Attach photos or videos"
                >
                  <span className="text-2xl" aria-hidden="true">📎</span>
                </label>
                <span className="text-xs text-gray-500">
                  {selectedFiles.length > 0 && `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
                </span>
              </div>

              {/* Submit Button - Responsive text */}
              <button
                type="submit"
                disabled={isSubmitting || (!textContent.trim() && selectedFiles.length === 0)}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold"
                title="Add to Your Reality"
                aria-label={isSubmitting ? 'Submitting capture...' : 'Add to Your Reality'}
              >
                {isSubmitting ? (
                  <>
                    <span className="text-xl" aria-hidden="true">⏳</span>
                    <span className="hidden md:inline">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl" aria-hidden="true">+</span>
                    <span className="hidden md:inline">Add to Your Reality</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Type your thoughts or attach photos and videos to capture your reality.</p>
          <p className="mt-1">Each text entry and file creates a separate capture.</p>
        </div>
      </main>
    </div>
  )
}
