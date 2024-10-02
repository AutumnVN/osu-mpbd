import { OsuReader } from 'osu-buffer';

export enum RankedStatus {
    Unknown = 0,
    Unsubmitted = 1,
    Pending = 2,
    Unused = 3,
    Ranked = 4,
    Approved = 5,
    Qualified = 6,
    Loved = 7
}

export enum GameplayMode {
    Standard = 0,
    Taiko = 1,
    Ctb = 2,
    Mania = 3
}

export type StarRating = Record<number, number>;

export type TimingPoints = [number, number, boolean][];

export enum UserPermissions {
    None = 0,
    Normal = 1,
    Moderator = 2,
    Supporter = 4,
    Friend = 8,
    Peppy = 16,
    WorldCupStaff = 32
}

export interface Beatmap {
    artistName: string;
    artistNameUnicode: string;
    songTitle: string;
    songTitleUnicode: string;
    creatorName: string;
    difficulty: string;
    audioFileName: string;
    md5: string;
    osuFileName: string;
    rankedStatus: RankedStatus;
    hitcircles: number;
    sliders: number;
    spinners: number;
    lastModified: bigint;
    ar: number;
    cs: number;
    hp: number;
    od: number;
    sliderVelocity: number;
    starRatingStardard: StarRating;
    starRatingTaiko: StarRating;
    starRatingCtb: StarRating;
    starRatingMania: StarRating;
    drainTime: number;
    totalTime: number;
    previewTime: number;
    timingPoints: TimingPoints;
    beatmapId: number;
    beatmapSetId: number;
    threadId: number;
    gradeStandard: number;
    gradeTaiko: number;
    gradeCtb: number;
    gradeMania: number;
    localOffset: number;
    stackLeniency: number;
    gameplayMode: GameplayMode;
    songSource: string;
    songTags: string;
    onlineOffset: number;
    titleFont: string;
    unplayed: boolean;
    lastPlayed: bigint;
    osz2: boolean;
    folderName: string;
    lastChecked: bigint;
    ignoreBeatmapSound: boolean;
    ignoreBeatmapSkin: boolean;
    disableStoryboard: boolean;
    disableVideo: boolean;
    visualOverride: boolean;
    lastModified2: number;
    maniaScrollSpeed: number;
}

export interface OsuDb {
    osuVersion: number;
    folderCount: number;
    accountUnlocked: boolean;
    accountUnlockDate: bigint;
    playerName: string;
    beatmapCount: number;
    beatmaps: Beatmap[];
    userPermissions: UserPermissions;
}

export function parseOsuDb(buffer: Buffer): OsuDb {
    const reader = new OsuReader(buffer.buffer);
    const osuVersion = reader.readInt32();
    const folderCount = reader.readInt32();
    const accountUnlocked = reader.readBoolean();
    const accountUnlockDate = reader.readInt64();
    const playerName = reader.readString() ?? '';
    const beatmapCount = reader.readInt32();
    const beatmaps = [];

    for (let i = 0; i < beatmapCount; i++) {
        const artistName = reader.readString() ?? '';
        const artistNameUnicode = reader.readString() ?? '';
        const songTitle = reader.readString() ?? '';
        const songTitleUnicode = reader.readString() ?? '';
        const creatorName = reader.readString() ?? '';
        const difficulty = reader.readString() ?? '';
        const audioFileName = reader.readString() ?? '';
        const md5 = reader.readString() ?? '';
        const osuFileName = reader.readString() ?? '';
        const rankedStatus = reader.readBytes(1)[0];
        const hitcircles = reader.readInt16();
        const sliders = reader.readInt16();
        const spinners = reader.readInt16();
        const lastModified = reader.readInt64();
        const ar = reader.readFloat();
        const cs = reader.readFloat();
        const hp = reader.readFloat();
        const od = reader.readFloat();
        const sliderVelocity = reader.readDouble();

        const starRating = [];
        for (let j = 0; j < 4; j++) {
            const length = reader.readInt32();
            const stars: StarRating = {};

            for (let k = 0; k < length; k++) {
                reader.readBytes(1);
                const mods = reader.readInt32();
                reader.readBytes(1);
                const star = reader.readDouble();
                stars[mods] = star;
            }

            starRating.push(stars);
        }

        const starRatingStardard = starRating[0];
        const starRatingTaiko = starRating[1];
        const starRatingCtb = starRating[2];
        const starRatingMania = starRating[3];
        const drainTime = reader.readInt32();
        const totalTime = reader.readInt32();
        const previewTime = reader.readInt32();

        const timingPoints: TimingPoints = [];
        const timingPointsLength = reader.readInt32();
        for (let j = 0; j < timingPointsLength; j++) {
            timingPoints.push([reader.readDouble(), reader.readDouble(), reader.readBoolean()]);
        }

        const beatmapId = reader.readInt32();
        const beatmapSetId = reader.readInt32();
        const threadId = reader.readInt32();
        const gradeStandard = reader.readBytes(1)[0];
        const gradeTaiko = reader.readBytes(1)[0];
        const gradeCtb = reader.readBytes(1)[0];
        const gradeMania = reader.readBytes(1)[0];
        const localOffset = reader.readInt16();
        const stackLeniency = reader.readFloat();
        const gameplayMode = reader.readBytes(1)[0];
        const songSource = reader.readString() ?? '';
        const songTags = reader.readString() ?? '';
        const onlineOffset = reader.readInt16();
        const titleFont = reader.readString() ?? '';
        const unplayed = reader.readBoolean();
        const lastPlayed = reader.readInt64();
        const osz2 = reader.readBoolean();
        const folderName = reader.readString() ?? '';
        const lastChecked = reader.readInt64();
        const ignoreBeatmapSound = reader.readBoolean();
        const ignoreBeatmapSkin = reader.readBoolean();
        const disableStoryboard = reader.readBoolean();
        const disableVideo = reader.readBoolean();
        const visualOverride = reader.readBoolean();
        const lastModified2 = reader.readInt32();
        const maniaScrollSpeed = reader.readBytes(1)[0];

        beatmaps.push({ artistName, artistNameUnicode, songTitle, songTitleUnicode, creatorName, difficulty, audioFileName, md5, osuFileName, rankedStatus, hitcircles, sliders, spinners, lastModified, ar, cs, hp, od, sliderVelocity, starRatingStardard, starRatingTaiko, starRatingCtb, starRatingMania, drainTime, totalTime, previewTime, timingPoints, beatmapId, beatmapSetId, threadId, gradeStandard, gradeTaiko, gradeCtb, gradeMania, localOffset, stackLeniency, gameplayMode, songSource, songTags, onlineOffset, titleFont, unplayed, lastPlayed, osz2, folderName, lastChecked, ignoreBeatmapSound, ignoreBeatmapSkin, disableStoryboard, disableVideo, visualOverride, lastModified2, maniaScrollSpeed });
    }

    const userPermissions = reader.readInt32();

    return { osuVersion, folderCount, accountUnlocked, accountUnlockDate, playerName, beatmapCount, beatmaps, userPermissions };
}
