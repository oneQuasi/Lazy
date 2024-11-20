export const resetOutput = async (outDir: string) => {
    try {
        await Deno.remove(outDir, { recursive: true });
    } catch {}
    await Deno.mkdir(outDir);
    await Deno.mkdir(`${outDir}/text`);
    await Deno.mkdir(`${outDir}/images`);
    await Deno.mkdir(`${outDir}/video`);
}