import { Box, Center, Flex } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { VideoFrame } from "./api";
import { getClient } from "./clients";

export const WatchStream: React.FC = () => {
	const { streamId } = useParams();

	const source = React.useMemo(() => {
		const ms = new MediaSource();
		ms.onsourceopen = () => {
			const videoBuffer = ms.addSourceBuffer('video/webm; codecs="vp9"');
			videoBuffer.mode = "sequence";
			videoBuffer.onerror = ev => console.log("ERROR", ev);
			videoBuffer.onupdateend = () => {
				// Don't keep too much video buffered.
				const buffered = videoBuffer.buffered;
				if (buffered.length === 0) {
					return;
				}

				const start = buffered.start(0);
				const end = buffered.end(0);
				if (end - start > 2) {
					console.log("Trimming buffer", { start, end });
					videoBuffer.remove(start, end - 2);
				}
			};
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
		<Center width="100%" height="100%" overflow="hidden" bg="black">
			<video
				src={sourceUrl}
				playsInline={true}
				autoPlay={true}
				muted={true}
				style={{ width: "100%", height: "100%", objectFit: "contain" }}
			/>
		</Center>
	)
};