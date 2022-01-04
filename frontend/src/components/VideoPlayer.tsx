import { Box, Center, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    topText?: string;
    bottomText?: string;
    src?: string;
    onClick?: () => void;
    videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
    videoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
}

export const VideoPlayer: React.FC<Props> = ({ src, topText, bottomText, onClick, videoRef, videoProps }) => (
    <Box width="100%" height="100%" position="relative" overflow="hidden" onClick={onClick}>
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
        {topText && <Text position="absolute" top={0} bg="blackAlpha.700" fontFamily="mono" p={2}>{topText}</Text>}
        {bottomText && <Text position="absolute" bottom={0} bg="blackAlpha.700" fontFamily="mono" p={2}>{bottomText}</Text>}
    </Box>
);
