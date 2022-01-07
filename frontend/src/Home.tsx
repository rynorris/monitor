import { Button, Container, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container height="100%" width="100%" padding={4} overflow="auto">
            <Text mb={4}>
                Turn an old phone into a secure, internet-connected baby monitor in
                one click!
            </Text>
            <Heading size="lg" mb={2}>Easy</Heading>
            <Text mb={4}>
                Set up a stream with a single click, and easily share stream details with other devices via a QR code.
            </Text>
            <Heading size="lg" mb={2}>Private</Heading>
            <Text mb={4}>
                There is no way to search for streams.  They are <strong>only</strong> discoverable via scanning your QR code.
            </Text>
            <Heading size="lg" mb={2}>Secure</Heading>
            <Text mb={4}>
                All video data is encrypted using industry-standard strong encryption methods, and the keys are <strong>not</strong> shared with the server.
                The <strong>only</strong> way to view the content is to receive the encryption keys by scanning the QR code.
            </Text>
            <Button
                onClick={() => navigate("/broadcast")}
                flex="none"
                colorScheme="green"
                width="100%"
                height="50px"
            >
                Start Broadcasting
            </Button>
        </Container>
    );
}
