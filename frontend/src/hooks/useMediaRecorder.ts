import React from "react";

export function useMediaRecorder(
    stream: MediaStream,
    options?: MediaRecorderOptions
): MediaRecorder | undefined {
    const [recorder, setRecorder] = React.useState<MediaRecorder>();

    React.useEffect(() => {
        const newRecorder = new MediaRecorder(stream, options);
        newRecorder.start();
        setRecorder(newRecorder);

        return () => {
            newRecorder.stop();
        };
    }, [stream, options]);

    return recorder;
}
