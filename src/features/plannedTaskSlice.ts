import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import taskService from "../services/task.service";
import { TaskObject } from "./taskSlice";

export interface PlannedTaskObject {
    due: number
    taskCount: number
    items: TaskObject[]
}

interface PlannedTask {
    plannedTasks: PlannedTaskObject[]
    status: 'idle' | 'loading'
}

export interface PlannedTaskState {
    value: PlannedTask
}

interface GetPlannedTaskResponse {
    success: PlannedTaskObject[]
    error?: Object
}

interface TaskError {
    error: Object
}

const initialState: PlannedTask = {
    plannedTasks: [],
    status: 'idle'
}

export const getPlannedTasks = createAsyncThunk<GetPlannedTaskResponse, void, { rejectValue: TaskError }>(
    "plannedTask/get",
    async () => {
        const data = await taskService.getPlannedTasks();
        return { success: data }
    }
)

export const plannedTaskSlice = createSlice({
    name: "plannedTask",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPlannedTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getPlannedTasks.fulfilled, (state, action: PayloadAction<GetPlannedTaskResponse>) => {
                state.status = 'idle';
                state.plannedTasks = action.payload.success;
            })
    }
})

export default plannedTaskSlice.reducer;