import { Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { selectConnected } from "../state/statusSlice";
import { useAppSelector } from "../state/store";

export const AppHeader: React.FC = () => {
    const connected = useAppSelector(selectConnected);

    return (
        <Flex
            width="100%"
            height={20}
            padding={4}
            alignItems="center"
            borderBottomWidth="1px"
            borderBottomColor="gray.200"
            borderBottomStyle="solid"
        >
            <Heading>Baby Monitor</Heading>
            <Spacer />
            <Text>{connected ? "Connected" : "Disconnected"}</Text>
        </Flex>
    );
};
