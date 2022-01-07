import React from "react";
import { selectProducer } from "./state/producerSlice";
import { useAppDispatch, useAppSelector } from "./state/store";
import {
    Button,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    useDisclosure,
    useInterval,
} from "@chakra-ui/react";
import { getClient } from "./clients";
import { VideoSegment } from "./api";
import { ShareQRCode } from "./components/ShareQRCode";
import { useMediaStream } from "./hooks/useMediaStream";
import { VideoPlayer } from "./components/VideoPlayer";
import { CreateBroadcastForm } from "./components/CreateBroadcastForm";
import * as Msgpack from "@msgpack/msgpack";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useAsRef } from "./hooks/useAsRef";
import { MEDIA_RECORDER_OPTIONS } from "./media";
import { hideToolbars, toggleToolbars } from "./state/layoutSlice";
import { broadcasting, notBroadcasting, pauseBroadcasting, selectBroadcasting } from "./state/statusSlice";
import { clearStats, selectStreamStats } from "./state/statsSlice";

export const Broadcast: React.FC = () => {
    const dispatch = useAppDispatch();
    const producer = useAppSelector(selectProducer);
    const stats = useAppSelector(selectStreamStats);
    const broadcastingState = useAppSelector(selectBroadcasting);
    const stateRef = useAsRef(broadcastingState);

    const video = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        const streamId = producer?.streamId;
        if (streamId != null) {
            getClient().startBroadcasting(streamId);
            dispatch(broadcasting());
            dispatch(hideToolbars());

            return () => {
                getClient().stopBroadcasting(streamId);
                dispatch(notBroadcasting());
                dispatch(clearStats(streamId))
            };
        } else {
            dispatch(notBroadcasting());
        }
    }, [dispatch, producer]);

    React.useEffect(() => {
        if (producer == null) {
            return;
        }

        if (stats?.subscribers === 0 && broadcastingState === "yes") {
            getClient().pauseBroadcasting(producer.streamId);
            dispatch(pauseBroadcasting());
        } else if ((stats?.subscribers ?? 0) > 0 && broadcastingState === "paused") {
            getClient().unpauseBroadcasting(producer.streamId);
            dispatch(broadcasting());
        }
    }, [stats, producer, broadcastingState, dispatch]);

    const [date, setDate] = React.useState<Date>(new Date());
    useInterval(() => {
        setDate(new Date());
    }, 1000);

    const constraints: MediaStreamConstraints = React.useMemo(() => ({
        video: {
            width: 320,
            height: 240,
            frameRate: 10.0,
            facingMode: "environment",
        },
    }), []);

    const handleSegment = React.useCallback(
        (ev: BlobEvent) => {
            (async () => {
                if (producer == null || stateRef.current === "paused") {
                    return;
                }

                const msg: VideoSegment = {
                    type: "segment",
                    timestamp: new Date(),
                    data: new Uint8Array(await ev.data.arrayBuffer()),
                };

                getClient().broadcast(
                    producer.streamId,
                    Msgpack.encode(msg),
                );
            })();

            const fr = new FileReader();
            fr.onload = () => {
            };
            fr.readAsDataURL(ev.data);
        },
        [producer, stateRef]
    );

    const stream = useMediaStream(constraints);

    React.useEffect(() => {
        if (stream != null && video.current != null) {
            video.current.srcObject = stream;
        }
    }, [stream, video]);

    useMediaRecorder(stream, handleSegment, MEDIA_RECORDER_OPTIONS);

    const { isOpen, onOpen, onClose } = useDisclosure();

    if (producer == null) {
        return <CreateBroadcastForm />;
    }

    const buttonStyleProps = {
        flex: "none",
        colorScheme: "green",
        width: "100%",
        height: "50px",
        maxW: 500,
    } as const;

    const topText = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);

    return (
        <Flex direction="column" height="100%" overflow="hidden">
            <VideoPlayer
                videoRef={video}
                topText={topText}
                bottomText={`${producer?.name} - ${stats?.subscribers ?? 0} viewers`}
                onClick={() => dispatch(toggleToolbars())}
            />
            <Flex direction="column" alignItems="center" padding={2}>
                <Button onClick={onOpen} {...buttonStyleProps}>
                    My QR Code
                </Button>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ShareQRCode producer={producer} />
                </ModalContent>
            </Modal>
        </Flex>
    );
};
