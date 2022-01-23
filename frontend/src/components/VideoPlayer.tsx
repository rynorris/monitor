import { Box, Center, IconButton, Text, useBoolean } from "@chakra-ui/react";
import { GoMute, GoUnmute } from "react-icons/go";
import React from "react";

interface Props {
    topText?: string;
    bottomText?: string;
    videoSrc?: string;
    audioSrc?: string;
    onClick?: () => void;
    videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
    videoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
}

export const VideoPlayer: React.FC<Props> = ({ videoSrc, audioSrc, topText, bottomText, onClick, videoRef, videoProps }) => {
    const [muted, { toggle: toggleMuted }] = useBoolean(true);
    const onToggleMute = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        toggleMuted();
    };

    return (
        <Box width="100%" height="100%" position="relative" overflow="hidden" onClick={onClick}>
            <Center width="100%" height="100%" overflow="hidden" bg="black">
                <video
                    src={videoSrc}
                    ref={videoRef}
                    playsInline={true}
                    autoPlay={true}
                    muted={true}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    {...videoProps}
                />
                <audio src={audioSrc} autoPlay={true} muted={muted} />
            </Center>
            {topText && <Text position="absolute" top={0} bg="blackAlpha.700" fontFamily="mono" p={2}>{topText}</Text>}
            {bottomText && <Text position="absolute" bottom={0} bg="blackAlpha.700" fontFamily="mono" p={2}>{bottomText}</Text>}
            {audioSrc && <IconButton icon={muted ? <GoMute /> : <GoUnmute />} aria-label="Toggle muted" onClick={onToggleMute} position="absolute" bottom={0} right={0} />}
        </Box>
    );
};
