import { Flex } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { VideoFrame } from "./api";
import { getClient } from "./clients";

export const Watch: React.FC = () => {
	const { streamId } = useParams();

	const source = React.useMemo(() => {
		const ms = new MediaSource();
		ms.onsourceopen = () => {
			const videoBuffer = ms.addSourceBuffer('video/webm; codecs="vp9"');
			videoBuffer.mode = "sequence";
			videoBuffer.onerror = ev => console.log("ERROR", ev);
		}
		return ms;
	}, []);

	const sourceUrl = React.useMemo(() => {
		return URL.createObjectURL(source);
	}, [source]);

	const handleMessage = React.useCallback((data: ArrayBuffer) => {
		if (source.readyState !== "open") {
			return;
		}

		(async () => {
			const dec = new TextDecoder();
			const msg: VideoFrame = JSON.parse(dec.decode(data));
			const segment = await fetch(msg.imageDataUrl);
			const buf = await segment.arrayBuffer();
			console.log(source.sourceBuffers[0]);
			source.sourceBuffers[0].appendBuffer(buf)
		})();
	}, [source]);

	React.useEffect(() => {
		if (streamId == null) {
			return;
		}

		const client = getClient();
		client.subscribe(streamId, handleMessage);

		return () => client.unsubscribe(streamId, handleMessage);
	}, [handleMessage, streamId]);

	return (
		<Flex direction="column" width="100%" height="100vh">
			<video src={sourceUrl} playsInline={true} autoPlay={true} muted={true} />
		</Flex>
	)
};