import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import salesCopilotReducer from '../reducers/salesCopilotReducer';

export const store = configureStore({
  reducer: {
    salesCopilotReducer: salesCopilotReducer.salesCopilotReducer,
    // Add other reducers here if any
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed versions of useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;