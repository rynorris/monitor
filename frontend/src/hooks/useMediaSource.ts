import React from "react";

export function useMediaSource(mimeType: string) {
    const [source, setSource] = React.useState<MediaSource>();

    React.useEffect(() => {
        const ms = new MediaSource();
        ms.onsourceopen = () => {
            const videoBuffer = ms.addSourceBuffer(mimeType);
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
                if (end - start > 1 && !videoBuffer.updating) {
                    videoBuffer.remove(start, end - 1);
                }
            };
        };
        setSource(ms);

        return () => {
            if (ms.readyState === "open") {
                ms.endOfStream();
            }
        };
    }, [mimeType]);

    return source;
}