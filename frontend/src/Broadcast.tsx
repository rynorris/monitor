import React from "react";
import { selectProducer } from "./state/producerSlice";
import { useAppSelector } from "./state/store";
import { Button, Flex, Modal, ModalContent, ModalOverlay, Spacer, useDisclosure } from "@chakra-ui/react";
import { getClient } from "./clients";
import { VideoFrame } from "./api";
import { ShareQRCode } from "./components/ShareQRCode";
import { useMediaStream } from "./hooks/useMediaStream";

export const Broadcast: React.FC = () => {
	const producer = useAppSelector(selectProducer);
	const video = React.useRef<HTMLVideoElement>(null);

	const handleSegment = React.useCallback((ev: BlobEvent) => {
		if (producer == null) {
			return;
		}

		const fr = new FileReader();
		fr.onload = () => {
			const msg: VideoFrame = {
				type: "frame",
				imageDataUrl: fr.result as string,
			};
			const enc = new TextEncoder();
			getClient().broadcast(producer.streamId, enc.encode(JSON.stringify(msg)));
		};
		fr.readAsDataURL(ev.data);
	}, [producer]);

	const rec = React.useRef<MediaRecorder>();

	const constraints: MediaStreamConstraints = {
		video: {
			width: 320,
			height: 240,
			frameRate: 10.00,
			facingMode: "environment",
		},
	};
	const stream = useMediaStream(constraints);

	React.useEffect(() => {
		if (stream == null) {
			return;
		}

		const handle = setInterval(
			() => {
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
			}, 500);

		return () => {
			clearInterval(handle);
			if (rec.current?.state === "recording") {
				rec.current?.stop();
			}
			rec.current?.stream?.getTracks()?.forEach(track => track.stop());
		};
	}, [handleSegment, stream]);

	const { isOpen, onOpen, onClose } = useDisclosure();

	if (producer == null) {
		return null;
	}

	return (
		<Flex direction="column" height="100vh">
			<video ref={video} playsInline={true} />
			<Spacer />
			<Button onClick={onOpen}>My QR Code</Button>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ShareQRCode producer={producer} />
				</ModalContent>
			</Modal>
		</Flex>
	);
};