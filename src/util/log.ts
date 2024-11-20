import { FrameInfo } from "../drawing/frame.ts";
import { Emotion } from "../drawing/pose.ts";

export const showFrameInfo = ({ mouth, pose }: FrameInfo) => {
    const positivity = mouth.positive ? '+' : '-';
    const phone = mouth.phoneome;

    const emotion = Emotion[pose.emotion];
    const blink = pose.blink;
    
    return `Mouth(${positivity}, ${phone}) & Pose(${emotion}, ${blink}-blink, ${pose.pose})`
}

export const logTime = async <T> (
    prefix: string, 
    task: Promise<T>,
    addLog: (log: any, popLast?: boolean) => void
) => {
    addLog(prefix);

    let secs = 0;
    const interval = setInterval(() => {
        addLog(`${prefix} ${++secs}s`, true);
    }, 1000);

    const out = await task;
    clearInterval(interval)
    return out;
}