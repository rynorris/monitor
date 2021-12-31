import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StreamProducer } from "../clients";
import { load, save } from "./persistence";
import { RootState } from "./store";

const PRODUCER_STORAGE_KEY = "producer.v1";

interface ProducerState {
    producer?: StreamProducer;
}

const initialState: ProducerState = {
    producer: load(PRODUCER_STORAGE_KEY, undefined),
};

export const producerSlice = createSlice({
    name: "producer",
    initialState,
    reducers: {
        setProducer: (state, action: PayloadAction<StreamProducer>) => {
            state.producer = action.payload;
            save(PRODUCER_STORAGE_KEY, state.producer);
        },
    },
});

export const { setProducer } = producerSlice.actions;

export const selectProducer = (state: RootState) => state.producer.producer;

export default producerSlice.reducer;