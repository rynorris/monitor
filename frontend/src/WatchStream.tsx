import React from "react";
import { useParams } from "react-router-dom";
import { VideoSegment } from "./api";
import { getClient } from "./clients";
import { VideoPlayer } from "./components/VideoPlayer";
import * as Msgpack from "@msgpack/msgpack";

export const WatchStream: React.FC = () => {
    const { streamId } = useParams();
    const [sourceUrl, setSourceUrl] = React.useState<string>();
    const source = React.useRef<MediaSource>();

    React.useEffect(() => {
        const ms = new MediaSource();
        ms.onsourceopen = () => {
            const videoBuffer = ms.addSourceBuffer('video/webm; codecs="vp9"');
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
        source.current = ms;
        setSourceUrl(URL.createObjectURL(ms));

        return () => {
            if (ms.readyState === "open") {
                ms.endOfStream();
            }
        };
    }, [source]);

    const handleMessage = React.useCallback(
        (data: ArrayBuffer) => {
            const ms = source.current;

            if (ms == null || ms.readyState !== "open") {
                return;
            }

            (async () => {
                const msg = Msgpack.decode<VideoSegment>(data) as VideoSegment;
                ms.sourceBuffers[0].appendBuffer(msg.data);
            })();
        },
        [source]
    );

    React.useEffect(() => {
        if (streamId == null) {
            return;
        }

        const client = getClient();
        client.subscribe(streamId, handleMessage);

        return () => client.unsubscribe(streamId, handleMessage);
    }, [handleMessage, streamId]);

    return <VideoPlayer src={sourceUrl} />;
};
