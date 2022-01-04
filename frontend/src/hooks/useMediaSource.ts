import React from "react";
import { VIDEO_CODEC } from "../media";

export function useMediaSource() {
    const [source, setSource] = React.useState<MediaSource>();

    React.useEffect(() => {
        const ms = new MediaSource();
        ms.onsourceopen = () => {
            const videoBuffer = ms.addSourceBuffer(VIDEO_CODEC);
            videoBuffer.mode = "sequence";
            videoBuffer.onerror = (ev) => console.log("ERROR", ev);
            videoBuffer.onupdateend = () => {
                // Don't keep too much video buffered.
                const buffered = videoBuffer.buffered;
                if (buffered.length === 0) {
                    return;
                }

                const start = buffered.start(0);
                const end = buffered.end(0);
                if (end - start > 2 && !videoBuffer.updating) {
                    videoBuffer.remove(start, end - 2);
                }
            };
        };
        setSource(ms);

        return () => {
            if (ms.readyState === "open") {
                ms.endOfStream();
            }
        };
    }, []);

    return source;
}