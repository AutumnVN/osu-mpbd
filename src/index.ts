import { createInterface } from 'node:readline/promises';

import { createWriteStream, existsSync, readFileSync, writeFileSync } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

import { parseOsuDb } from './osudb';

interface Beatmap2 {
    beatmapset_id: number;
    difficulty_rating: number;
    id: number;
    mode: string;
    status: string;
    total_length: number;
    user_id: number;
    version: string;
}

interface Cover {
    cover: string;
    'cover@2x': string;
    card: string;
    'card@2x': string;
    list: string;
    'list@2x': string;
    slimcover: string;
    'slimcover@2x': string;
}

interface Beatmapset {
    artist: string;
    artist_unicode: string;
    covers: Cover;
    creator: string;
    favourite_count: number;
    hype?: unknown;
    id: number;
    nsfw: boolean;
    offset: number;
    play_count: number;
    preview_url: string;
    source: string;
    spotlight: boolean;
    status: string;
    title: string;
    title_unicode: string;
    track_id?: unknown;
    user_id: number;
    video: boolean;
}

interface MostPlayedBeatmap {
    beatmap_id: number;
    count: number;
    beatmap: Beatmap2;
    beatmapset: Beatmapset;
}

(async function () {
    const { LOCALAPPDATA } = process.env;

    let osuPath = `${LOCALAPPDATA}\\osu!`;
    if (!existsSync(`${osuPath}\\osu!.db`)) {
        if (!existsSync('.env')) {
            writeFileSync('.env', 'OSU_FOLDER_PATH=\n');
            return console.error('.env file not found, created one, please set OSU_FOLDER_PATH in .env file');
        }

        process.loadEnvFile();

        const { OSU_FOLDER_PATH } = process.env;

        if (!OSU_FOLDER_PATH) return console.error('Default osu! folder not found, please set OSU_FOLDER_PATH in .env file');

        osuPath = OSU_FOLDER_PATH;
        if (!existsSync(`${osuPath}\\osu!.db`)) return console.error('osu!.db not found in OSU_FOLDER_PATH');
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const playerId = await rl.question('Enter player ID: ');
    if (!playerId || isNaN(Number(playerId))) return console.error('Invalid player ID');

    const amount = Number(await rl.question('Enter amount of beatmapsets to download: '));
    if (!amount || isNaN(amount)) return console.error('Invalid amount');

    const noVideo = await rl.question('Prefer no video? (y)/n: ');
    const preferNoVideo = !noVideo.toLowerCase().includes('n');

    const { beatmaps } = parseOsuDb(readFileSync(`${osuPath}\\osu!.db`));
    const existedBeatmapsets = [...new Set(beatmaps.map(b => b.beatmapSetId))];
    const neededToDownloadBeatmapsets: number[] = [];
    const metadata: Record<number, { artist: string, creator: string, title: string }> = {};
    let i = 0;

    console.log('Getting most played beatmapsets');

    while (neededToDownloadBeatmapsets.length < amount) {
        const res = await fetch(`https://chino.pages.dev/osuapiv2/users/${playerId}/beatmapsets/most_played?offset=${i}&limit=100`).then(res => res.json()) as MostPlayedBeatmap[];
        if (!res.length) break;

        for (const { beatmap, beatmapset } of res) {
            if (neededToDownloadBeatmapsets.length >= amount) break;
            if (!existedBeatmapsets.includes(beatmap.beatmapset_id) && !neededToDownloadBeatmapsets.includes(beatmap.beatmapset_id)) {
                neededToDownloadBeatmapsets.push(beatmap.beatmapset_id);
                metadata[beatmap.beatmapset_id] = {
                    artist: beatmapset.artist,
                    creator: beatmapset.creator,
                    title: beatmapset.title,
                }
            }
        }

        process.stdout.write('\u001b[1A\u001b[2K');
        console.log(`Getting most played beatmapsets (${neededToDownloadBeatmapsets.length}/${amount}) from ${i + 100} most played beatmaps`);
        i += 100;
    }

    console.log(`Downloading ${neededToDownloadBeatmapsets.length} beatmapsets to ${osuPath}\\Songs`);

    for (let i = 0; i < neededToDownloadBeatmapsets.length; i++) {
        const beatmapsetId = neededToDownloadBeatmapsets[i];
        console.log(`[${i + 1}/${neededToDownloadBeatmapsets.length}] Downloading ${metadata[beatmapsetId].creator} | ${metadata[beatmapsetId].artist} - ${metadata[beatmapsetId].title}`);
        const res = await fetch(`https://catboy.best/d/${beatmapsetId}${preferNoVideo ? 'n' : ''}`);
        if (!res.ok || !res.body) {
            process.stdout.write('\u001b[1A\u001b[2K');
            console.error(`[${i + 1}/${neededToDownloadBeatmapsets.length}] Failed to download beatmapset ${beatmapsetId} `);
            continue;
        }

        const destination = `${osuPath}\\Songs\\${beatmapsetId} ${`${metadata[beatmapsetId].artist} - ${metadata[beatmapsetId].title}`.replace(/[\\/:*?"<>|]/g, '_')}.osz`;
        const fileStream = createWriteStream(destination);
        await finished(Readable.from(res.body).pipe(fileStream));
        process.stdout.write('\u001b[1A\u001b[2K');
        console.log(`[${i + 1}/${neededToDownloadBeatmapsets.length}] Downloaded ${metadata[beatmapsetId].creator} | ${metadata[beatmapsetId].artist} - ${metadata[beatmapsetId].title}`);
    }
    console.log('Done.');
})().finally(() => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
});
