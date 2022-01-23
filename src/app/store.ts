import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import authReducer from "../features/authSlice"
import taskReducer from "../features/taskSlice"
import plannedTaskReducer from "../features/plannedTaskSlice"

// Export all reducers
export const store = configureStore({
    reducer: {
        auth: authReducer,
        task: taskReducer,
        plannedTask: plannedTaskReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();