export type Phoneme = {
    duration: number;
    phone: string;
};

export type Word = {
    alignedWord: string;
    case: 'success' | string;
    end: number;
    endOffset: number;
    phones: Phoneme[];
    start: number;
    startOffset: number;
    word: string;
};

export type GentleTranscript = {
    transcript: string;
    words: Word[];
};

export const processPhones = async (audioPath: string) => {
    const cmd = new Deno.Command("bash", {
        args: [ "./run-gentle.sh", audioPath ]
    });

    const { success, stdout, stderr } = await cmd.output();
    if (!success) {
        throw new Error(new TextDecoder().decode(stderr));
    }

    const raw = new TextDecoder().decode(stdout);
    return JSON.parse(raw) as GentleTranscript;
}