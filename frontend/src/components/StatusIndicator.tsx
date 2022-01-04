import { Badge } from "@chakra-ui/react";
import React from "react";
import { selectConnected } from "../state/statusSlice";
import { useAppSelector } from "../state/store";

export const StatusIndicator: React.FC = () => {
    const connected = useAppSelector(selectConnected);

    return (
        <Badge colorScheme={connected ? "green" : "gray"}>{connected ? "Connected" : "Connecting..."}</Badge>
    )
};