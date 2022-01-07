import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box padding={2}>
            <Text mb={4}>
                Turn an old phone into a secure, internet-connected baby monitor in
                one click!
            </Text>
            <Heading size="lg" mb={2}>Private</Heading>
            <Text mb={4}>
                Video streams are keyed by an opaque ID, and not discoverable via the server.
            </Text>
            <Heading size="lg" mb={2}>Secure</Heading>
            <Text mb={4}>
                All video data is encrypted using industry-standard strong encryption methods, and the keys are <strong>not</strong> shared with the server.
            </Text>
            <Heading size="lg" mb={2}>Easy</Heading>
            <Text mb={4}>
                Set up a stream with a single click, and easily share stream details with other devices via a QR code.
            </Text>
            <Button
                onClick={() => navigate("/broadcast")}
                flex="none"
                colorScheme="green"
                width="100%"
                height="50px"
                maxW="500px"
            >
                Start Broadcasting
            </Button>

        </Box>
    );
}
