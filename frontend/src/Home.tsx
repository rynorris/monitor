import { Button, Divider, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { newStream, StreamConsumer, StreamProducer } from "./clients";
import { selectConsumers } from "./state/consumersSlice";
import { useAppDispatch, useAppSelector } from "./state/store";

export const Home: React.FC = () => {
    const consumers = useAppSelector(selectConsumers);

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        (async () => {
            const producer: StreamProducer = await newStream("Test");
            const consumer: StreamConsumer = { ...producer, signingPublicKey: producer.signingKeyPair.publicKey! };

            /*
            dispatch(registerProducer(await freezeProducer(producer)));
            dispatch(registerConsumer(await freezeConsumer(consumer)));
            */
        })()
    }, [dispatch]);

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
            <Heading>View again</Heading>
            <Flex direction="column" flexGrow={1} overflowY="scroll" width="100%" alignItems="center">
                {consumers.map(consumer => (
                    <Button key={consumer.streamId} variant="outline" {...buttonStyleProps}>{consumer.name}</Button>
                ))}
            </Flex>
            <Divider />
        </>
    ) : null;

    return (
        <Flex direction="column" height="100vh" alignItems="center">
            {viewAgain}
            <Button {...buttonStyleProps}>Add New</Button>
            <Button {...buttonStyleProps}>Broadcast</Button>
        </Flex>
    );
};
