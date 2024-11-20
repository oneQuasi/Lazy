export interface Transcription {
    transcribe(audioPath: string): Promise<string>
}