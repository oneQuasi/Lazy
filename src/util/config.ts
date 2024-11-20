import JSON5 from 'npm:json5';

export interface LazyConfig {
    audioPath: string,
    mouthCoordsPath: string,
    posesDir: string,
    mouthsDir: string,
    outDir: string,
    transcription: {
        type: 'assembly',
        apiKey: string
    },
    sentiment: {
        type: 'openai',
        apiKey: string
    }
}

export const loadConfig = async (path: string) => {
    const content = await Deno.readTextFile(path);

    return JSON5.parse(content) as LazyConfig;
}