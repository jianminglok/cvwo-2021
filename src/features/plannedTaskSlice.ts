import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import taskService from "../services/task.service";

export interface PlannedTask {
    Due: number
    taskCount: number
    items: TaskObject[]
}

export interface TaskObject {
    ID: string
    name: string
    tags: string[]
    priority: string
    completed: boolean
    ownerId: string
    dueDateTime: Date
}

interface Task {
    plannedTasks: PlannedTask[]
    status: 'idle' | 'loading'
}

interface GetPlannedTaskResponse {
    success: PlannedTask[]
    error?: Object
}

export interface UserState {
    value: Task
}

interface TaskError {
    error: Object
}

export interface TaskFilters {
    tag?: string
    priority?: string
    sortBy?: string
    getPlanned?: boolean
}

const initialState: Task = {
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