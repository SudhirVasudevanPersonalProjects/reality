/**
 * Unit Tests: OCR functionality for Deep-Capture
 * Uses mocked Tesseract.js
 */

import { extractTextFromImage, isImageFile } from '@/lib/ocr/tesseract'

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn()
}))

import Tesseract from 'tesseract.js'

describe('Deep-Capture OCR', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractTextFromImage', () => {
    it('should extract text from image successfully', async () => {
      const mockFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' })
      const mockResult = {
        data: {
          text: 'Extracted text from image',
          confidence: 95
        }
      }

      ;(Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult)

      const result = await extractTextFromImage(mockFile)

      expect(result.text).toBe('Extracted text from image')
      expect(result.confidence).toBe(95)
      expect(Tesseract.recognize).toHaveBeenCalledWith(mockFile, 'eng', expect.any(Object))
    })

    it('should handle empty text extraction', async () => {
      const mockFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' })
      const mockResult = {
        data: {
          text: '   ',
          confidence: 0
        }
      }

      ;(Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult)

      const result = await extractTextFromImage(mockFile)

      expect(result.text).toBe('')
      expect(result.confidence).toBe(0)
    })

    it('should throw error on OCR failure', async () => {
      const mockFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' })

      ;(Tesseract.recognize as jest.Mock).mockRejectedValue(new Error('OCR failed'))

      await expect(extractTextFromImage(mockFile)).rejects.toThrow('Could not extract text from image')
    })

    it('should trim extracted text', async () => {
      const mockFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' })
      const mockResult = {
        data: {
          text: '  Text with spaces  \n\n',
          confidence: 85
        }
      }

      ;(Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult)

      const result = await extractTextFromImage(mockFile)

      expect(result.text).toBe('Text with spaces')
    })
  })

  describe('isImageFile', () => {
    it('should return true for image/jpeg', () => {
      const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' })
      expect(isImageFile(file)).toBe(true)
    })

    it('should return true for image/png', () => {
      const file = new File(['data'], 'test.png', { type: 'image/png' })
      expect(isImageFile(file)).toBe(true)
    })

    it('should return true for image/heic', () => {
      const file = new File(['data'], 'test.heic', { type: 'image/heic' })
      expect(isImageFile(file)).toBe(true)
    })

    it('should return false for video files', () => {
      const file = new File(['data'], 'test.mp4', { type: 'video/mp4' })
      expect(isImageFile(file)).toBe(false)
    })

    it('should return false for audio files', () => {
      const file = new File(['data'], 'test.mp3', { type: 'audio/mpeg' })
      expect(isImageFile(file)).toBe(false)
    })

    it('should return false for PDF files', () => {
      const file = new File(['data'], 'test.pdf', { type: 'application/pdf' })
      expect(isImageFile(file)).toBe(false)
    })
  })
})
