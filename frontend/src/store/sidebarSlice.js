import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSidebarOpen: true,
};

// Create Redux slice
const sidebarSlice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        closeSidebar: (state) => {
            state.isSidebarOpen = false;
        },
        openSidebar: (state) => {
            state.isSidebarOpen = true;
        },
    },
});

export const { toggleSidebar, closeSidebar, openSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
