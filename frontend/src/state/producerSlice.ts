import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FrozenProducer } from "../clients";
import { RootState } from "./store";

interface ProducerState {
    producer?: FrozenProducer;
}

const initialState: ProducerState = {};

export const producerSlice = createSlice({
    name: "producer",
    initialState,
    reducers: {
        setProducer: (state, action: PayloadAction<FrozenProducer>) => {
            state.producer = action.payload;
        },
    },
});

export const { setProducer } = producerSlice.actions;

export const selectProducer = (state: RootState) => state.producer.producer;

export default producerSlice.reducer;
