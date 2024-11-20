// @deno-types="npm:@types/lodash"
import _ from 'npm:lodash';
import { Phoneme, processPhones, Word } from '../phones/gentle.ts';
import { renderPose, Emotion, Mouth, Pose, generatePose } from "./pose.ts";
import { categorizePhone, findMouth, PhonemeCategory } from "./phones.ts";
import random from "../util/random.ts";
import { alignWords } from "./align.ts";
import { Sentence } from "../sentiment/index.ts";

export interface FrameInfo {
    mouth: Mouth,
    pose: Pose
}

export interface PhonemeInfo extends Phoneme {
    start: number,
    end: number,
    word: Word
}

export const prepareFrames = (words: Word[], sentences: Sentence[]) => {
    const durationSecs = Math.max(...words.map(i => i.end ?? 0)) + 1;
    const durationFrames = Math.ceil(durationSecs * 30);  

    const frames: FrameInfo[] = [];

    const phones: PhonemeInfo[] = [];

    const poseChanges: [ number, Sentence, Pose ][] = [];

    let lastSentence: Sentence | null = null;
    for (const group of alignWords(words, sentences)) {
        if (group == null) continue;
        const [ word, sentenceInfo ] = group;

        if (word == null) continue;
        if (sentenceInfo == null) continue;
        const sentence = sentenceInfo.sentence;

        const firstSentence = lastSentence == null;
        const addPoseChange = firstSentence || 
            !_.isEqual(lastSentence, sentence);

        if (addPoseChange) {
            lastSentence = sentence;
            poseChanges.push([ 
                firstSentence ? 0 : word.start, 
                sentence,
                generatePose(sentence.emotion) 
            ]);
        }
        
        let start = word.start;
        
        for (const phone of (word.phones ?? [])) {
            phones.push({
                ...phone,
                start,
                end: start + phone.duration,
                word
            });
    
            start += phone.duration;
        }
    }

    poseChanges.reverse();

    let lastCategory: PhonemeCategory | null = null;
    let frameLength = 0;

    while (frames.length < durationFrames) {
        const frame = frames.length;
    
        let pose: Pose | null = null;
        for (const [ start, _, newPose ] of poseChanges) {
            if ((frame / 30) >= start) {
                pose = newPose;
                break;
            }
        }

        if (pose == null) throw new Error('Could not find pose.');

        frames[frame] = {
            mouth: {
                phoneome: 8,
                positive: [ Emotion.Happy, Emotion.Explain, Emotion.RQ ].includes(pose.emotion)
            },
            pose: { ...pose }
        }
    
        if (pose.blink > 0) {
            pose.blink = 0;
        } else if (random.bool(1 / 90)) {
            pose.blink = 1;
        }
    
        const foundPhone = phones.find(
            phone => (
                frame >= (phone.start * 30) && 
                frame <= (phone.end * 30)
            )
        );
    
        if (foundPhone == null) {
            lastCategory = null;
            frameLength = 0;
            continue;
        }
    
        const foundIndex = phones.indexOf(foundPhone);
    
        const prevPhone = phones[foundIndex - 1]?.phone;
        const phone = foundPhone.phone;
        const nextPhone = phones[foundIndex + 1]?.phone;
    
        const category = categorizePhone(phone);
        if (category == lastCategory) {
            frameLength += 1;   
        } else {
            frameLength = 0;
        }
    
        frames[frame].mouth.phoneome = findMouth({
            prevPhone,
            phone,
            nextPhone
        }, frameLength);
    
        lastCategory = category;
    }

    return frames;
}