import { processPhones } from './phones/gentle.ts';
import { prepareFrames } from "./drawing/frame.ts";
import { percent } from "./util/general.ts";
import { renderFFmpeg } from './render/ffmpeg.ts';
import JSON5 from 'npm:json5';
import { loadConfig } from "./util/config.ts";
import { resetOutput } from "./util/reset.ts";
import { Assembly } from "./transcription/assembly.ts";
import { logTime } from "./util/log.ts";
import { draw } from "./drawing/draw.ts";
import { applyAnalysis } from "./sentiment/index.ts";
import { GPT } from "./sentiment/emotions.ts";
import chalk from "npm:chalk";

export const run = async (
    addLog: (log: any, popLast?: boolean) => void,
    configPath: string
) => {
    const config = await loadConfig(configPath);
    await resetOutput(config.outDir);

    const transcription = new Assembly(config.transcription.apiKey);
    const sentimentAnalysis = new GPT(config.sentiment.apiKey);

    const transcript = await logTime(
        'Transcribing...', 
        transcription.transcribe(config.audioPath), 
        addLog
    );

    await Deno.writeTextFile(`${config.outDir}/text/transcript.txt`, transcript); 

    const { words } = await logTime(
        'Processing phones...', 
        processPhones(config.audioPath), 
        addLog
    );

    await Deno.writeTextFile(`${config.outDir}/text/words.json5`, JSON5.stringify(words, null, 4));

    addLog(`Processing sentences...`);
    const sentences = await applyAnalysis(
        sentimentAnalysis,
        transcript,
        (sentence, sentences) => {
            addLog(`Processing sentences... ${percent(sentence / sentences)}`, true);
        }
    );

    const frames = prepareFrames(words, sentences);
    addLog(`Prepared frames: ${frames.length}`);

    addLog('Drawing... 0%');
    await draw(
        config,
        frames,
        (frame, totalFrames) => {
            addLog(`Drawing... ${percent(frame / totalFrames)}`, true)
        }
    );

    const { success, stderr } = await logTime(
        'Rendering...', 
        renderFFmpeg(config.audioPath, config.outDir), 
        addLog
    );

    addLog(`Render success: ${success}`);
    if (!success) addLog(chalk.red(new TextDecoder().decode(stderr)));
}