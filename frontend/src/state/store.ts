import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import consumersSlice from "./consumersSlice";
import producerSlice from "./producerSlice";
import statusSlice from "./statusSlice";
import layoutSlice from "./layoutSlice";
import { bootstrapClient } from "./thunks";

export const store = configureStore({
    reducer: {
        consumers: consumersSlice,
        producer: producerSlice,
        status: statusSlice,
        layout: layoutSlice,
    },
});

store.dispatch(bootstrapClient());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
