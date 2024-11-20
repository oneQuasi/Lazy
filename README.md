# Lazy

Lazy is a project based off of [lazykh](https://github.com/carykh/lazykh). It takes in an audio file, and automatically generates a video of Cary's avatar speaking. The avatar is lipsynced and changes poses based on the emotion of the sentence it's saying.

To achieve this, Lazy follows the given process:

1. **Transcription**: Transcribe the content spoken in the audio file.
2. **Phoneme Generation**: Generate a list of phonemes sounded at any given time.
3. **Sentiment Analysis**: Show which sentences match which emotions.
4. **Drawing**: Use the phonemes and found emotions to draw all frames.
5. **Rendering**: Generate a final video.

## Usage

1. Set up [gentle](https://github.com/lowerquality/gentle) for lipsyncing.
    - As gentle's website is down, you may need to [copy the "exp" folder from a docker container](https://github.com/lowerquality/gentle/issues/336).
2. Create a `config.json5`. An example config is shown below:

```json5
{
    audioPath: "./input/e.wav",
    mouthCoordsPath: "./input/mouthCoordinates.csv",
    posesDir: "./input/poses",
    mouthsDir: "./input/mouths",
    outDir: "./output",
    transcription: {
        type: "assembly",
        apiKey: "API KEY"
    },
    sentiment: {
        type: "openai",
        apiKey: "API KEY"
    }
}
```

3. Run it with this command: `deno run --allow-all src/main.tsx config.json5`

## Compared to `lazykh`

There are some key differences between this project and its inspiration:

1. `lazykh` requires both an audio file and transcript, whilst `Lazy` only requires an audio file.

2. `lazykh` requires your transcript to be labelled with emotion tags for emotion changes. `Lazy` doesn't, as it automatically detects sentiment.

3. `lazykh` is written in Python, whilst `Lazy` is written in TypeScript (Deno).