import React from "react";
import { selectProducer } from "./state/producerSlice";
import { useAppSelector } from "./state/store";
import {
    Button,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    Spacer,
    useDisclosure,
} from "@chakra-ui/react";
import { getClient } from "./clients";
import { VideoSegment } from "./api";
import { ShareQRCode } from "./components/ShareQRCode";
import { useMediaStream } from "./hooks/useMediaStream";
import { VideoPlayer } from "./components/VideoPlayer";
import { CreateBroadcastForm } from "./components/CreateBroadcastForm";
import * as Msgpack from "@msgpack/msgpack";

export const Broadcast: React.FC = () => {
    const producer = useAppSelector(selectProducer);
    const video = React.useRef<HTMLVideoElement>(null);

    const handleSegment = React.useCallback(
        (ev: BlobEvent) => {
            (async () => {
                if (producer == null) {
                    return;
                }

                const msg: VideoSegment = {
                    type: "segment",
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
        [producer]
    );

    const rec = React.useRef<MediaRecorder>();

    const constraints: MediaStreamConstraints = {
        video: {
            width: 320,
            height: 240,
            frameRate: 10.0,
            facingMode: "environment",
        },
    };
    const stream = useMediaStream(constraints);

    React.useEffect(() => {
        if (stream != null && video.current != null) {
            video.current.srcObject = stream;
        }
    }, [stream, video]);

    React.useEffect(() => {
        if (stream == null) {
            return;
        }

        const handle = setInterval(() => {
            try {
                if (rec.current != null && rec.current.state === "recording") {
                    rec.current.stop();
                }

                rec.current = new MediaRecorder(stream, {
                    mimeType: 'video/webm; codecs="vp9"',
                    bitsPerSecond: 200000,
                });
                rec.current.ondataavailable = handleSegment;
                rec.current.start();
            } catch (e: unknown) {
                console.error("Failed to load media stream", e);
            }
        }, 1000);

        return () => {
            clearInterval(handle);
            if (rec.current?.state === "recording") {
                rec.current?.stop();
            }
            rec.current?.stream?.getTracks()?.forEach((track) => track.stop());
        };
    }, [handleSegment, stream]);

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

    return (
        <Flex direction="column" height="100%" overflow="hidden">
            <VideoPlayer videoRef={video} />
            <Spacer />
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
