import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage by default
import authReducer from "./authSlice.js";
import sidebarReducer from "./sidebarSlice.js";
import notificationReducer from './notificationSlice';

// Define persist config
const persistConfig = {
    key: "root",  // This will be the key used in localStorage
    storage,      // Use localStorage (you can change this to sessionStorage if you prefer)
};

// Wrap the authReducer with persistReducer to enable persistence
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedSideBarReducer = persistReducer(persistConfig, sidebarReducer);
const persistedNotificationReducer = persistReducer(persistConfig, notificationReducer);

// Create the store with the persisted reducer
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        sidebar: persistedSideBarReducer,
        notifications: persistedNotificationReducer,
    },
});

// Create the persistor instance to manage rehydration
export const persistor = persistStore(store);
