import { Flex, Heading, Spacer } from "@chakra-ui/react";
import React from "react";
import { StatusIndicator } from "./StatusIndicator";

export const AppHeader: React.FC = () => {
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
            <StatusIndicator />
        </Flex>
    );
};
