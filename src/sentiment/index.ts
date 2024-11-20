import { Emotion } from "../drawing/pose.ts";
import { split } from 'npm:sentence-splitter';
import { group } from "../util/general.ts";

export interface SentimentAnalysis {
    classify(content: string): Promise<Emotion | null>
}

export interface Sentence {
    emotion: Emotion,
    content: string
}

export const applyAnalysis = async (
    analysis: SentimentAnalysis,
    content: string,
    progress: (content: number, sentences: number) => void
) => {
    const sentences = split(content)
        .map(node => node.raw.trim())
        .filter(sent => sent.length > 0);

    const out: Sentence[] = [];

    const batches = group([ ... sentences.entries() ], 20);

    for (const batch of batches) {
        const classifiedSentences = await Promise.all(batch.map(async ([ ind, sentence ]) => {
            const previousSentence = sentences?.[ind - 1]?.trim() ?? '';
            const nextSentence = sentences?.[ind - 1]?.trim() ?? '';

            const content = `${nextSentence} ${sentence} ${previousSentence}`.trim();
            const emotion = await analysis.classify(content) ?? Emotion.Explain;
            return { content: sentence, emotion };
        }));

        out.push(...classifiedSentences);

        const ind = batch[batch.length - 1][0];
        progress(ind + 1, classifiedSentences.length);
    }
    return out;
}