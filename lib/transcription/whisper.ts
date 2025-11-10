/**
 * Audio transcription placeholder
 * WhisperLive integration is deferred for MVP
 */

export interface TranscriptionResult {
  text: string
  supported: boolean
}

/**
 * Attempt to transcribe audio file
 * Currently returns not supported for MVP
 */
export async function transcribeAudio(file: File): Promise<TranscriptionResult> {
  // TODO: Integrate WhisperLive or alternative transcription service
  console.log('Audio transcription not yet implemented for file:', file.name)

  return {
    text: '',
    supported: false,
  }
}

/**
 * Check if a file is an audio file
 */
export function isAudioFile(file: File): boolean {
  const audioTypes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a']
  return audioTypes.includes(file.type) || file.name.match(/\.(m4a|mp3|wav)$/i) !== null
}
