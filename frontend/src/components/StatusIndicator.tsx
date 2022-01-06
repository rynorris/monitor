import { Badge } from "@chakra-ui/react";
import React from "react";
import { selectBroadcasting, selectConnected } from "../state/statusSlice";
import { useAppSelector } from "../state/store";

export const StatusIndicator: React.FC = () => {
    const connected = useAppSelector(selectConnected);
    const broadcasting = useAppSelector(selectBroadcasting);

    const text = !connected ? "Connecting..."
        : broadcasting === "yes" ? "Broadcasting"
            : broadcasting === "paused" ? "Idle"
                : "Connected";

    return (
        <Badge colorScheme={connected ? "green" : "gray"}>{text}</Badge>
    )
};