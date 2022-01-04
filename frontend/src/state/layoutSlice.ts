import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface LayoutState {
    hideToolbars: boolean;
}

const initialState: LayoutState = {
    hideToolbars: false,
};

export const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers: {
        hideToolbars: state => {
            state.hideToolbars = true;
        },
        showToolbars: state => {
            state.hideToolbars = false;
        },
        toggleToolbars: state => {
            state.hideToolbars = !state.hideToolbars;
        },
    },
});

export const { hideToolbars, showToolbars, toggleToolbars } = layoutSlice.actions;

export const selectHideToolbars = (state: RootState) => state.layout.hideToolbars;

export default layoutSlice.reducer;
