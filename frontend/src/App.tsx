import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from "./state/store";
import { Home } from './Home';
import { Broadcast } from "./Broadcast";
import { Watch } from './Watch';

function App() {
    return (
        <ChakraProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/broadcast" element={<Broadcast />} />
                        <Route path="/watch/:streamId" element={<Watch />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ChakraProvider>
    );
}

export default App;
