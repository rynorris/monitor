import React from "react";
import { useParams } from "react-router-dom";
import { DataMsg } from "./api";
import { getClient } from "./clients";
import { VideoPlayer } from "./components/VideoPlayer";
import * as Msgpack from "@msgpack/msgpack";
import { useMediaSource } from "./hooks/useMediaSource";
import { useAppDispatch, useAppSelector } from "./state/store";
import { selectConsumer } from "./state/consumersSlice";
import { hideToolbars, showToolbars, toggleToolbars } from "./state/layoutSlice";
import { useBoolean } from "@chakra-ui/react";
import { AUDIO_CODEC, VIDEO_CODEC } from "./media";

export const WatchStream: React.FC = () => {
    const { streamId } = useParams();

    const dispatch = useAppDispatch();
    const consumer = useAppSelector(selectConsumer(streamId));

    const [muted, { toggle: toggleMuted }] = useBoolean(true);
    const [date, setDate] = React.useState<Date>();

    const videoSource = useMediaSource(VIDEO_CODEC);
    const audioSource = useMediaSource(AUDIO_CODEC);
    const videoSrc = React.useMemo(() => {
        if (videoSource == null) {
            return undefined;
        }

        return URL.createObjectURL(videoSource);
    }, [videoSource]);

    const audioSrc = React.useMemo(() => {
        if (audioSource == null) {
            return undefined;
        }

        return URL.createObjectURL(audioSource);
    }, [audioSource]);

    React.useEffect(() => {
        if (streamId == null || videoSource == null || audioSource == null) {
            return;
        }

        const handleMessage = (data: ArrayBuffer) => {
            (async () => {
                const msg = Msgpack.decode(data) as DataMsg;
                switch (msg.type) {
                    case "video-segment":
                        if (videoSource.readyState !== "open") {
                            return;
                        }

                        videoSource.sourceBuffers[0].appendBuffer(msg.data);
                        setDate(msg.timestamp);
                        break;
                    case "audio-segment":
                        if (audioSource.readyState !== "open") {
                            return;
                        }

                        audioSource.sourceBuffers[0].appendBuffer(msg.data);
                        break;
                }
            })();
        };

        const client = getClient();
        client.subscribe(streamId, handleMessage);

        return () => client.unsubscribe(streamId, handleMessage);
    }, [streamId, videoSource, audioSource, setDate]);

    React.useEffect(() => {
        dispatch(hideToolbars());
        return () => {
            dispatch(showToolbars());
        };
    }, [dispatch]);

    const topText = date != null
        ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
        : undefined;

    return (
        <>
            <VideoPlayer
                src={videoSrc}
                topText={topText}
                bottomText={consumer?.name}
                onClick={() => dispatch(toggleToolbars())}
            />
            <audio src={audioSrc} autoPlay={true} muted={muted} />
        </>
    );
};
