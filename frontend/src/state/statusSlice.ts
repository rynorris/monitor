import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface StatusState {
    connected: boolean;
}

const initialState: StatusState = {
    connected: false,
};

export const statusSlice = createSlice({
    name: "status",
    initialState,
    reducers: {
        connect: (state) => {
            state.connected = true;
        },
        disconnect: (state) => {
            state.connected = false;
        },
    },
});

export const { connect, disconnect } = statusSlice.actions;

export const selectConnected = (state: RootState) => state.status.connected;

export default statusSlice.reducer;
