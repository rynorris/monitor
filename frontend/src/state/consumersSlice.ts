import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StreamConsumer } from "../clients";
import { load, save } from "./persistence";
import { RootState } from "./store";

const CONSUMERS_STORAGE_KEY = "consumers.v1";

interface ConsumersState {
    consumers: StreamConsumer[];
}

const initialState: ConsumersState = {
    consumers: load(CONSUMERS_STORAGE_KEY, []),
};

export const consumersSlice = createSlice({
    name: "consumers",
    initialState,
    reducers: {
        addConsumer: (state, action: PayloadAction<StreamConsumer>) => {
            state.consumers = [...state.consumers.filter(c => c.streamId !== action.payload.streamId), action.payload];
            save(CONSUMERS_STORAGE_KEY, state.consumers);
        },

        removeConsumer: (state, action: PayloadAction<string>) => {
            state.consumers = state.consumers.filter(c => c.streamId !== action.payload);
            save(CONSUMERS_STORAGE_KEY, state.consumers);
        },
    },
});

export const { addConsumer, removeConsumer } = consumersSlice.actions;

export const selectConsumers = (state: RootState) => state.consumers.consumers;

export default consumersSlice.reducer;