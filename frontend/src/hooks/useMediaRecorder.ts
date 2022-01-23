import React from "react";

export function useMediaRecorder(
    stream: MediaStream | undefined,
    handleSegment: (ev: BlobEvent) => void,
    interval: number,
    options?: MediaRecorderOptions
) {
    const rec = React.useRef<MediaRecorder>();

    React.useEffect(() => {
        if (stream == null) {
            return;
        }
        console.log("NEW RECORDER", stream);

        const handle = setInterval(() => {
            try {
                if (rec.current != null && rec.current.state === "recording") {
                    rec.current.stop();
                }

                rec.current = new MediaRecorder(stream, options);
                rec.current.ondataavailable = handleSegment;
                rec.current.start();
            } catch (e: unknown) {
                console.error("Failed to load media stream", e);
            }
        }, interval);

        return () => {
            clearInterval(handle);
            if (rec.current?.state === "recording") {
                rec.current?.stop();
            }
        };
    }, [handleSegment, stream, options, interval]);

}
