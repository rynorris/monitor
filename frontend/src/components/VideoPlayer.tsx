import { Center } from "@chakra-ui/react";
import React from "react";

interface Props
    extends React.DetailedHTMLProps<
        React.VideoHTMLAttributes<HTMLVideoElement>,
        HTMLVideoElement
    > {
    videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
}

export const VideoPlayer: React.FC<Props> = (props) => (
    <Center width="100%" height="100%" overflow="hidden" bg="black">
        <video
            ref={props.videoRef}
            playsInline={true}
            autoPlay={true}
            muted={true}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            {...props}
        />
    </Center>
);
