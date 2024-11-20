import { AssemblyAI } from "npm:assemblyai";
import { Transcription } from './index.ts';

export class Assembly implements Transcription {
    assemblyAI: AssemblyAI
    constructor(apiKey: string) {
        this.assemblyAI = new AssemblyAI({
            apiKey
        });
    }
    
    async transcribe(audioPath: string) {
        const transcript = await this.assemblyAI.transcripts.transcribe({
            audio: audioPath
        });
        const { text } = transcript;

        if (text == null) {
            throw new Error('Failed to gather transcript');
        }

        return text;
    }
}