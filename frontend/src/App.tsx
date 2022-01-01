import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from "./state/store";
import { Home } from './Home';
import { Broadcast } from "./Broadcast";

function App() {
    return (
        <ChakraProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/broadcast" element={<Broadcast />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ChakraProvider>
    );
}

export default App;
