import { Button, Flex, Heading, Modal, ModalContent, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ScanQRCode } from "./components/ScanQRCode";
import { selectConsumers } from "./state/consumersSlice";
import { useAppSelector } from "./state/store";

export const Watch: React.FC = () => {
    const navigate = useNavigate();
    const consumers = useAppSelector(selectConsumers);

    const buttonStyleProps = {
        flex: "none",
        colorScheme: "green",
        width: "100%",
        height: "50px",
        maxW: 500,
        marginTop: 2,
    } as const;

    const viewAgain = consumers.length > 0 ? (
        <>
            <Heading>Watch again</Heading>
            <Flex direction="column" flexGrow={1} overflow="auto" width="100%" alignItems="center">
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
        </>
    ) : null;

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Flex direction="column" height="100%" alignItems="center" padding={2}>
            {viewAgain}
            <Button onClick={onOpen} {...buttonStyleProps}>Scan QR Code</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ScanQRCode />
                </ModalContent>
            </Modal>
        </Flex>
    );
};
