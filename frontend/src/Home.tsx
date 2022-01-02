import { Box, Heading, Text } from "@chakra-ui/react";
import React from "react";

export const Home: React.FC = () => (
    <Box padding={2}>
        <Heading>Baby Monitor</Heading>
        <Text>
            Turn an old phone into a secure, internet-connected baby monitor in one click!
        </Text>
    </Box>
);