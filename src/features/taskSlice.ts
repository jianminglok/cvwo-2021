import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import taskService from "../services/task.service";

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
    tasks: TaskObject[]
    status: 'idle' | 'loading'
}

interface GetTaskResponse {
    success: TaskObject[]
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
    searchQuery?: string
}

const initialState: Task = {
    tasks: [],
    status: 'idle'
}

export const getTasks = createAsyncThunk<GetTaskResponse, TaskFilters, { rejectValue: TaskError }>(
    "task/get",
    async (taskFilters) => {
        const data = await taskService.getTasks(taskFilters.tag, taskFilters.priority, taskFilters.sortBy, taskFilters.searchQuery);
        return { success: data }
    }
)

export const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getTasks.fulfilled, (state, action: PayloadAction<GetTaskResponse>) => {
                state.status = 'idle';
                state.tasks = action.payload.success;
            })
    }
})

export default taskSlice.reducer;