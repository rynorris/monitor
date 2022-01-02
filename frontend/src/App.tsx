import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from "./state/store";
import { Broadcast } from "./Broadcast";
import { Layout } from './Layout';
import { Watch } from './Watch';
import { WatchStream } from './WatchStream';
import { Home } from './Home';
import theme from './theme';

function App() {
    return (
        <ChakraProvider theme={theme}>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="/broadcast" element={<Broadcast />} />
                            <Route path="/watch" element={<Watch />} />
                            <Route path="/watch/:streamId" element={<WatchStream />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ChakraProvider>
    );
}

export default App;
