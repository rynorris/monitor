import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface StatusState {
    connected: boolean;
    broadcasting: "yes" | "no" | "paused";
}

const initialState: StatusState = {
    connected: false,
    broadcasting: "no",
};

export const statusSlice = createSlice({
    name: "status",
    initialState,
    reducers: {
        connect: state => {
            state.connected = true;
        },
        disconnect: state => {
            state.connected = false;
        },
        broadcasting: state => {
            state.broadcasting = "yes";
        },
        notBroadcasting: state => {
            state.broadcasting = "no";
        },
        pauseBroadcasting: state => {
            state.broadcasting = "paused";
        },
    },
});

export const { connect, disconnect, broadcasting, notBroadcasting, pauseBroadcasting } = statusSlice.actions;

export const selectConnected = (state: RootState) => state.status.connected;
export const selectBroadcasting = (state: RootState) => state.status.broadcasting;

export default statusSlice.reducer;
