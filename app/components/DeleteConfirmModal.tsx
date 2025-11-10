'use client'

import { useEffect } from 'react'

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-gray-900 border-4 border-red-600 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 id="delete-modal-title" className="text-2xl font-bold text-red-500 mb-4">
          Delete this thought?
        </h2>
        <p className="text-gray-300 mb-6">
          This action cannot be undone. This will permanently delete this Mind something and all its connections.
        </p>
        <div className="flex space-x-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
