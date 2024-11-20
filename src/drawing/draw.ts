import { FrameInfo } from "./frame.ts";
import { createMouthCoords, renderPose } from "./pose.ts";
import { group, hash, Path } from "../util/general.ts";
import { LazyConfig } from "../util/config.ts";

export const draw = async (
    config: LazyConfig,
    frames: FrameInfo[],
    progress: (frame: number, totalFrames: number) => void
) => {
    const {
        posesDir,
        mouthsDir,
        mouthCoordsPath,
        outDir
    } = config;

    const mouthCoords = await createMouthCoords(mouthCoordsPath);
    
    const cache: Record<string, Path> = {};
    const batches = group([ ...frames.entries() ], 20);

    for (const batch of batches) {
        await Promise.all(batch.map(async ([ frame, { pose, mouth } ]) => {
            const id = await hash({ mouth, pose });
            const path: Path = `${outDir}/images/${frame}.png`;
        
            const cached = id in cache;

            if (cached) {
                await Deno.copyFile(cache[id], path);
            } else {
                const image = await renderPose(
                    posesDir,
                    mouthsDir,
                    mouthCoords, 
                    mouth, 
                    pose
                );
                await image.write(path);
                cache[id] = path;
            }
        }));

        const lastBatchFrame = batch[batch.length - 1][0];

        progress(lastBatchFrame, frames.length);
    }
}