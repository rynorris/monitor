import { Box, Grid } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/Navbar";
import { CompatibilityBarrier } from "./components/CompatibilityBarrier";

export const Layout: React.FC = () => {
    return (
        <Grid height="100%" gridTemplateRows="max-content 1fr max-content">
            <AppHeader />
            <Box flexGrow={1} overflow="hidden">
                <CompatibilityBarrier>
                    <Outlet />
                </CompatibilityBarrier>
            </Box>
            <Navbar />
        </Grid>
    );
};
