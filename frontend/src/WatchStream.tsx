import React from "react";
import { useParams } from "react-router-dom";
import { VideoSegment } from "./api";
import { getClient } from "./clients";
import { VideoPlayer } from "./components/VideoPlayer";
import * as Msgpack from "@msgpack/msgpack";
import { useMediaSource } from "./hooks/useMediaSource";

export const WatchStream: React.FC = () => {
    const { streamId } = useParams();

    const source = useMediaSource();
    const sourceUrl = React.useMemo(() => {
        if (source == null) {
            return undefined;
        }

        return URL.createObjectURL(source);
    }, [source]);

    React.useEffect(() => {
        if (streamId == null || source == null) {
            return;
        }

        const handleMessage = (data: ArrayBuffer) => {
            if (source.readyState !== "open") {
                return;
            }

            (async () => {
                const msg = Msgpack.decode<VideoSegment>(data) as VideoSegment;
                source.sourceBuffers[0].appendBuffer(msg.data);
            })();
        };

        const client = getClient();
        client.subscribe(streamId, handleMessage);

        return () => client.unsubscribe(streamId, handleMessage);
    }, [streamId, source]);

    return <VideoPlayer src={sourceUrl} />;
};
