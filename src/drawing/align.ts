import JSON5 from 'npm:json5';
import { GentleTranscript, Word } from "../phones/gentle.ts";
import { split } from 'npm:sentence-splitter';
import { splitWords } from "../util/general.ts";
// @deno-types="npm:@types/lodash"
import _ from 'npm:lodash';
import { Sentence } from "../sentiment/index.ts";

export const alignWords = (words: Word[], sentences: Sentence[]) => {
    let gentleWordInd = 0;
    let sentenceWordInd = 0;

    const sentenceWords = sentences.flatMap(sentence => 
        splitWords(sentence.content)
            .map(word => ({ word, sentence }))
    )

    let maxLength = Math.max(words.length, sentenceWords.length);

    const out: [ Word, { word: string, sentence: Sentence } ][] = [];

    while (gentleWordInd < maxLength) {
        const word = words[gentleWordInd];
        const sentenceInfo = sentenceWords[sentenceWordInd];

        const gentleWord = word?.word?.toLowerCase();
        const sentWord = sentenceInfo?.word?.toLowerCase();

        if (
            gentleWord != null && 
            sentWord != null &&
            gentleWord != '<unk>' && 
            gentleWord != sentWord
        ) {
            const nextGentleWord = words[gentleWordInd + 1]?.word?.toLowerCase();
            const nextSentWord = sentenceWords[sentenceWordInd + 1]?.word?.toLowerCase();

            if (sentWord == nextGentleWord) {
                gentleWordInd += 1;
            } else if (gentleWord == nextSentWord) {
                sentenceWordInd += 1;
            }
        }

        if (word != null && sentenceInfo != null) {
            out.push([ word, sentenceInfo ]);
        }

        gentleWordInd += 1;
        sentenceWordInd += 1;
    }
    
    return out;
}