import React from "react";
import { Alert, AlertIcon, Center, Stack, Text } from "@chakra-ui/react";

import { AUDIO_CODEC, VIDEO_CODEC } from "../media";

interface CompatibilityCheck {
    name: string;
    isSupported: () => boolean;
}

const CHECKS: CompatibilityCheck[] = [
    {
        name: "Media Source Extensions",
        isSupported: () => "MediaSource" in window,
    },
    {
        name: "Webm/vp9 video recording",
        isSupported: () => MediaRecorder.isTypeSupported(VIDEO_CODEC),
    },
    {
        name: "Webm/vp9 video playback",
        isSupported: () => window.MediaSource?.isTypeSupported(VIDEO_CODEC),
    },
    {
        name: "Webm/opus audio recording",
        isSupported: () => MediaRecorder.isTypeSupported(AUDIO_CODEC),
    },
    {
        name: "Webm/opus audio playback",
        isSupported: () => window.MediaSource?.isTypeSupported(AUDIO_CODEC),
    },
];

export const CompatibilityBarrier: React.FC = ({ children }) => {
    const allSupported = CHECKS.every(check => check.isSupported());

    if (allSupported) {
        return <>{children}</>;
    } else {
        const alerts = CHECKS.map(check => (
            <Alert key={check.name} status={check.isSupported() ? "success" : "error"}>
                <AlertIcon />
                {check.name}
            </Alert>
        ));

        return (
            <Center width="100%" height="100%" padding={4}>
                <Stack spacing={3}>
                    <Text>Your browser does not support all the features required for this app.</Text>
                    {alerts}
                </Stack>
            </Center>
        );
    }
}