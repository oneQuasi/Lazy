import { FrameInfo } from "../drawing/frame.ts";
import { Emotion } from "../drawing/pose.ts";

// @deno-types="@types/react"
import React from 'npm:react';

export type State<T> = [ T, React.Dispatch<React.SetStateAction<T>> ]

export const percent = (num: number) => `${(num * 100).toFixed(1)}%`;

export const splitWords = (content: string) => {
    const segmenter = new Intl.Segmenter([], { granularity: 'word' });
    const segmentedText = segmenter.segment(content);
    const words = [...segmentedText].filter(s => s.isWordLike).map(s => s.segment);

    return words;
}

export const hash = async <T> (obj: T): Promise<string> => {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj);
  
    // Encode the JSON string to a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
  
    // Compute the SHA-256 hash using Deno's crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

export const group = <T>(arr: T[], groupSize: number = 5): T[][] => {
    const result: T[][] = [];
  
    for (let i = 0; i < arr.length; i += groupSize) {
      result.push(arr.slice(i, i + groupSize));
    }
  
    return result;
}

export type Path = `${string}.${string}` ;
