import { Flex } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { VideoFrame } from "./api";
import { getClient } from "./clients";

export const Watch: React.FC = () => {
	const { streamId } = useParams();
	const image = React.useRef<HTMLImageElement>(null);

	const handleMessage = React.useCallback((data: ArrayBuffer) => {
		const dec = new TextDecoder();
		const msg: VideoFrame = JSON.parse(dec.decode(data));
		const imageEl = image.current;
		if (imageEl != null) {
			imageEl.src = msg.imageDataUrl;
		}
	}, []);

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
			<img ref={image} alt="video stream" style={{ flex: "none" }} />
		</Flex>
	)
};