import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface StatusState {
    connected: boolean;
    broadcasting: boolean;
}

const initialState: StatusState = {
    connected: false,
    broadcasting: false,
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
            state.broadcasting = true;
        },
        notBroadcasting: state => {
            state.broadcasting = false;
        },
    },
});

export const { connect, disconnect, broadcasting, notBroadcasting } = statusSlice.actions;

export const selectConnected = (state: RootState) => state.status.connected;
export const selectBroadcasting = (state: RootState) => state.status.broadcasting;

export default statusSlice.reducer;
