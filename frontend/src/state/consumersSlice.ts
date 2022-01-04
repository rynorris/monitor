import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FrozenConsumer } from "../clients";
import { RootState } from "./store";

interface ConsumersState {
    consumers: FrozenConsumer[];
}

const initialState: ConsumersState = {
    consumers: [],
};

export const consumersSlice = createSlice({
    name: "consumers",
    initialState,
    reducers: {
        addConsumer: (state, action: PayloadAction<FrozenConsumer>) => {
            state.consumers = [
                ...state.consumers.filter(
                    (c) => c.streamId !== action.payload.streamId
                ),
                action.payload,
            ];
        },

        removeConsumer: (state, action: PayloadAction<string>) => {
            state.consumers = state.consumers.filter(
                (c) => c.streamId !== action.payload
            );
        },
    },
});

export const { addConsumer, removeConsumer } = consumersSlice.actions;

export const selectConsumers = (state: RootState) => state.consumers.consumers;
export const selectConsumer = (streamId: string | undefined) => (state: RootState) => state.consumers.consumers.find(c => c.streamId === streamId);

export default consumersSlice.reducer;
