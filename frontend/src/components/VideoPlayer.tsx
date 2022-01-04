import { Center, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    overlayText?: string;
    src?: string;
    videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
    videoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
}

export const VideoPlayer: React.FC<Props> = ({ src, overlayText, videoRef, videoProps }) => (
    <>
        <Center width="100%" height="100%" overflow="hidden" bg="black">
            <video
                src={src}
                ref={videoRef}
                playsInline={true}
                autoPlay={true}
                muted={true}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                {...videoProps}
            />
        </Center>
        {overlayText && <Text position="absolute" top={0} bg="blackAlpha.700" fontFamily="mono" paddingLeft={2} paddingRight={2}>{overlayText}</Text>}
    </>
);
