import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Client, newStream, StreamConsumer, StreamProducer } from './clients';
import { Provider } from 'react-redux';
import { store } from "./state/store";

function App() {
    React.useEffect(() => {
        (async () => {
            const client = new Client();
            client.connect("ws://localhost:8080/ws")

            const producer: StreamProducer = await newStream("Test");
            const consumer: StreamConsumer = { ...producer, signingPublicKey: producer.signingKeyPair.publicKey! };

            client.registerProducer(producer);
            client.registerConsumer(consumer);

            const dec = new TextDecoder();
            const enc = new TextEncoder();

            client.subscribe(producer.streamId, msg => console.log("RECEIVED MSG", dec.decode(msg)));

            setInterval(() => {
                console.log("BROADCASTING");
                client.broadcast(producer.streamId, enc.encode("Hello World!"));
            }, 1000);

            const otherProducer = await newStream("Other");
            client.registerProducer(otherProducer);

            setInterval(() => {
                console.log("BROADCASTING");
                client.broadcast(otherProducer.streamId, enc.encode("Shouldn't receive this!"));
            }, 1000);

            return () => {
                client.close();
            };
        })()
    });

    return (
        <ChakraProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ChakraProvider>
    );
}

export default App;
