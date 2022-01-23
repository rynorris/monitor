
export const VIDEO_CODEC = 'video/webm; codecs="vp9"';
export const AUDIO_CODEC = 'audio/webm; codecs="opus"';

export const VIDEO_RECORDER_OPTIONS: MediaRecorderOptions = {
    mimeType: VIDEO_CODEC,
    bitsPerSecond: 150000,
};

export const AUDIO_RECORDER_OPTIONS: MediaRecorderOptions = {
    mimeType: AUDIO_CODEC,
    bitsPerSecond: 15000,
};