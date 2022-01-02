import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";

export const Layout: React.FC = () => {
    return (
        <Flex direction="column" height="100%">
            <Box flexGrow={1}>
                <Outlet />
            </Box>
            <Navbar />
        </Flex>
    );
};