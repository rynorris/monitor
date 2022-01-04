import { Box, Collapse, Fade, Flex } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/Navbar";
import { CompatibilityBarrier } from "./components/CompatibilityBarrier";
import { useAppSelector } from "./state/store";
import { selectHideToolbars } from "./state/layoutSlice";
import { StatusIndicator } from "./components/StatusIndicator";

export const Layout: React.FC = () => {
    const hideToolbars = useAppSelector(selectHideToolbars);

    return (
        <Flex height="100%" direction="column">
            <Collapse in={!hideToolbars}>
                <AppHeader />
            </Collapse>
            <Box flexGrow={1} overflow="hidden" position="relative">
                <CompatibilityBarrier>
                    <Outlet />
                </CompatibilityBarrier>
                <Fade in={hideToolbars}>
                    <Box position="absolute" right={2} top={1}>
                        <StatusIndicator />
                    </Box>
                </Fade>
            </Box>
            <Collapse in={!hideToolbars}>
                <Navbar />
            </Collapse>
        </Flex>
    );
};
