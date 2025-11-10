import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

/**
 * Extract text from an image using Tesseract OCR
 * @param file Image file to process
 * @returns Extracted text and confidence score
 */
export async function extractTextFromImage(file: File): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m), // Optional: log progress
    })

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    }
  } catch (error) {
    console.error('OCR extraction failed:', error)
    throw new Error('Could not extract text from image')
  }
}

/**
 * Check if a file is an image that can be processed by OCR
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}
