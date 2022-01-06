import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface StatsState {
    streamStats: Record<string, StreamStats>
}

interface StreamStats {
    streamId: string;
    subscribers: number;
}

const initialState: StatsState = {
    streamStats: {},
}

export const statsSlice = createSlice({
    name: "stats",
    initialState,
    reducers: {
        setStats: (state, action: PayloadAction<StreamStats>) => {
            state.streamStats[action.payload.streamId] = action.payload;
        },
    }
})

export const { setStats } = statsSlice.actions;

export const selectStreamStats = (state: RootState) => state.producer.producer != null ? state.stats.streamStats[state.producer.producer.streamId] : undefined;

export default statsSlice.reducer;