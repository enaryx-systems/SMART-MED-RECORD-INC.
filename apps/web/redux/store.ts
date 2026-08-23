import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import orgFilterReducer from "./orgFilterSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    orgFilter: orgFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
