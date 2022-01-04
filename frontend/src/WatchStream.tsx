import React from "react";
import { useParams } from "react-router-dom";
import { VideoSegment } from "./api";
import { getClient } from "./clients";
import { VideoPlayer } from "./components/VideoPlayer";
import * as Msgpack from "@msgpack/msgpack";
import { useMediaSource } from "./hooks/useMediaSource";
import { useAppSelector } from "./state/store";
import { selectConsumer } from "./state/consumersSlice";

export const WatchStream: React.FC = () => {
    const { streamId } = useParams();

    const consumer = useAppSelector(selectConsumer(streamId));

    const [date, setDate] = React.useState<Date>();

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
                setDate(msg.timestamp);
            })();
        };

        const client = getClient();
        client.subscribe(streamId, handleMessage);

        return () => client.unsubscribe(streamId, handleMessage);
    }, [streamId, source, setDate]);

    const overlayText = `${consumer?.name ?? ""} - ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)}`;

    return <VideoPlayer src={sourceUrl} overlayText={overlayText} />;
};
