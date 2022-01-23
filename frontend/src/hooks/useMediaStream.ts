import React from "react";

export function useMediaStream(
    constraints: MediaStreamConstraints
): MediaStream | undefined {
    const [stream, setStream] = React.useState<MediaStream>();

    React.useEffect(() => {
        (async () => {
            try {
                const ms = await navigator.mediaDevices.getUserMedia(
                    constraints
                );
                setStream(ms);
            } catch (e: unknown) {
                console.error("Failed to load media stream", e);
            }
        })();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        return () => {
            if (stream != null) {
                stream.getTracks().forEach(track => {
                    track.stop();
                    stream.removeTrack(track);
                });
            }
        };
    }, [stream]);

    return stream;
}
