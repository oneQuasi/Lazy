import { Emotion } from "../drawing/pose.ts";
import { SentimentAnalysis } from './index.ts';
import OpenAI from 'jsr:@openai/openai';

const classifyPrompt = (content: string) => `
> ${content}
Classify the above text into one of six emotions: Explain, Happy, Sad, Angry, Confused, RQ (rhetorical question)
Respond only with one word
`.trim();

const getClassificationResponse = async (client: OpenAI, content: string) => {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: classifyPrompt(content) }],
        model: 'gpt-4o-mini',
        max_tokens: 2
    });

    return chatCompletion.choices[0].message.content;
}

export class GPT implements SentimentAnalysis {
    openai: OpenAI
    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey
        });
    }

    async classify(content: string) {
        const response = await getClassificationResponse(this.openai, content);

        if (response == null) {
            return null;
        } 

        return Emotion[response as keyof typeof Emotion];
    }
}