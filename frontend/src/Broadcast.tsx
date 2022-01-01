import React from "react";
import { selectProducer } from "./state/producerSlice";
import { useAppSelector } from "./state/store";
import { useMediaStream } from "./hooks/useMediaStream";
import { Flex, useInterval } from "@chakra-ui/react";
import { getClient } from "./clients";
import { VideoFrame } from "./api";

export const Broadcast: React.FC = () => {
	const producer = useAppSelector(selectProducer);
	const media = useMediaStream({ video: true });
	const video = React.useRef<HTMLVideoElement>(null);
	const canvas = React.useRef<HTMLCanvasElement>(null);

	React.useEffect(() => {
		if (video.current != null && media != null && video.current.srcObject !== media) {
			console.log("Attaching video");
			video.current.srcObject = media;
			video.current.play();
			video.current.setAttribute("playsinline", "true");
		}
	}, [video, media])

	const processStream = React.useCallback(() => {
		const canvasEl = canvas.current;
		const videoEl = video.current;
		const ctx = canvasEl?.getContext("2d");
		console.log("Processing frame", { canvasEl, videoEl, producer, ctx });
		if (producer != null && canvasEl != null && ctx != null && videoEl != null && videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
			canvasEl.width = videoEl.videoWidth;
			canvasEl.height = videoEl.videoHeight;
			ctx.drawImage(videoEl, 0, 0);

			const msgData: VideoFrame = {
				type: "frame",
				imageDataUrl: canvasEl.toDataURL("image/jpeg", 80),
			};

			const enc = new TextEncoder();

			getClient().broadcast(producer.streamId, enc.encode(JSON.stringify(msgData)));
		}
	}, [canvas, video, producer]);

	useInterval(processStream, 200);

	return (
		<Flex direction="column">
			<video ref={video} playsInline={true} />
			<canvas ref={canvas} />
		</Flex>
	);
};