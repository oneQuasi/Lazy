export const renderFFmpeg = async (audioPath: string, outDir: string) => {
    const cmd = new Deno.Command('ffmpeg', {
        args: [ 
            '-framerate', '30', 
            '-i', './output/images/%d.png',
            '-i', audioPath,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p', 
            '-c:a', 'aac', 
            '-shortest',
            '-preset', 'fast',
            '-crf', '30',
            `${outDir}/video/video.mp4`
        ]
    });
    
    return await cmd.output();
}