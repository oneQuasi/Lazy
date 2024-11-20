import { Jimp } from 'npm:jimp';
import random from "../util/random.ts";
import { JimpInstance } from "npm:jimp";

export enum Emotion {
    Explain,
    Happy,
    Sad,
    Angry,
    Confused,
    RQ
}

export interface Pose {
    pose: number,
    emotion: Emotion,
    blink: number
}

export interface Mouth {
    phoneome: number,
    positive: boolean
}

export const createMouthCoords = async (mouthCoordsPath: string) => {
    const mouthCoordsRaw = await Deno.readTextFile(mouthCoordsPath);
    const mouthCoords = mouthCoordsRaw.split('\n')
        .map(line => line.split(',').map(parseFloat));

    // Scale from 360p to 1080p
    for (const row of mouthCoords) {
        row[0] *= 3;
        row[1] *= 3;
    }

    return mouthCoords;
}

export const generatePose = (emotion: Emotion): Pose => {
    return {
        pose: random.integer(0, 4),
        emotion: emotion,
        blink: 0     
    };
}

const imageCache: Record<string, any> = {};

export const loadImage = async (path: string) => {
    if (!(path in imageCache)) {
        imageCache[path] = await Jimp.read(path);
    }

    return imageCache[path].clone();
}

export const renderPose = async (
    posesDir: string,
    mouthsDir: string,
    mouthCoords: number[][], 
    mouth: Mouth, 
    pose: Pose
) => {
    const poseInd = pose.emotion * 5 + pose.pose;
    const poseIndBlinker = 3 * poseInd + pose.blink;
    const mouthInd = mouth.phoneome + (mouth.positive ? 0 : 11);

    const poseIndPadded = `${poseIndBlinker + 1}`.padStart(4, '0');
    const mouthIndPadded = `${mouthInd + 1}`.padStart(4, '0');

    const poseImg = await loadImage(`${posesDir}/pose${poseIndPadded}.png`);
    const mouthImg = await loadImage(`${mouthsDir}/mouth${mouthIndPadded}.png`);

    if (mouthCoords[poseInd][2] < 0) {
        mouthImg.flip({
            horizontal: true, 
            vertical: false
        })
    }

    if (mouthCoords[poseInd][3] != 1) {
        mouthImg.resize({
            w: Math.abs(mouthImg.width * mouthCoords[poseInd][2]), 
            h: mouthImg.height * mouthCoords[poseInd][3]
        });
    }
    if (mouthCoords[poseInd][4] != 0) {
        mouthImg.rotate(-mouthCoords[poseInd][4])
    }

    const x = mouthCoords[poseInd][0] - mouthImg.width / 2;
    const y = mouthCoords[poseInd][1] - mouthImg.height / 2;

    poseImg.composite(mouthImg, x, y);
    return poseImg;
}