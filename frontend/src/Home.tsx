import { Button, Divider, Flex, Heading, Modal, ModalContent, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ScanQRCode } from "./components/ScanQRCode";
import { ShareQRCode } from "./components/ShareQRCode";
import { selectConsumers } from "./state/consumersSlice";
import { useAppSelector } from "./state/store";

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const consumers = useAppSelector(selectConsumers);

    const buttonStyleProps = {
        flex: "none",
        colorScheme: "blue",
        width: "100%",
        height: "50px",
        maxW: 500,
        margin: 2,
    } as const;

    const viewAgain = consumers.length > 0 ? (
        <>
            <Heading>Watch again</Heading>
            <Flex direction="column" flexGrow={1} overflowY="scroll" width="100%" alignItems="center">
                {consumers.map(consumer => (
                    <Button
                        key={consumer.streamId}
                        variant="outline"
                        onClick={() => navigate(`/watch/${consumer.streamId}`)}
                        {...buttonStyleProps}
                    >
                        {consumer.name}
                    </Button>
                ))}
            </Flex>
            <Divider />
        </>
    ) : null;

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Flex direction="column" height="100vh" alignItems="center">
            {viewAgain}
            <Button {...buttonStyleProps} onClick={onOpen}>Watch</Button>
            <Button {...buttonStyleProps} onClick={() => navigate("/broadcast")}>Broadcast</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ScanQRCode />
                </ModalContent>
            </Modal>
        </Flex>
    );
};
