export const resetOutput = async (outDir: string) => {
    await Deno.remove(outDir, { recursive: true });
    await Deno.mkdir(outDir);
    await Deno.mkdir(`${outDir}/text`);
    await Deno.mkdir(`${outDir}/images`);
    await Deno.mkdir(`${outDir}/video`);
}