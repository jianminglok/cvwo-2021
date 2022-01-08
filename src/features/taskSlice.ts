import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addDays, endOfDay, endOfToday, formatRFC3339, getDate, setDate } from "date-fns";
import taskService from "../services/task.service";

export interface GroupedTasks {
    completed: boolean
    taskCount: number
    items: TaskObject[]
}

export interface TaskObject {
    TaskID: string
    name: string
    tags: string[]
    priority: string
    completed: boolean
    ownerId: string
    dueDateTime: Date
}

interface Task {
    groupedTasks: GroupedTasks[]
    status: 'idle' | 'loading'
    taskSliceError?: Object
    taskSliceSuccess?: boolean
}

interface GetTaskResponse {
    success: GroupedTasks[]
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

export interface TaskServiceResponse {
    success: Object
    error?: Object
}

export interface CreateTask {
    taskName: string
    tags?: any
    priority: string
    dueDate?: Date
    dueTime?: Date
    ownerId: string
}

export interface CompleteTask {
    taskId: string
}

export interface DeleteTask {
    taskId: string
}

const initialState: Task = {
    groupedTasks: [],
    status: 'idle',
}

export const getTasks = createAsyncThunk<GetTaskResponse, TaskFilters, { rejectValue: TaskError }>(
    "task/get",
    async (taskFilters) => {
        const data = await taskService.getTasks(taskFilters.tag, taskFilters.priority, taskFilters.sortBy, taskFilters.searchQuery);
        return { success: data }
    }
)

export const createTask = createAsyncThunk<TaskServiceResponse, CreateTask, { rejectValue: TaskError }>(
    "task/create",
    async (createTaskDetails, thunkAPI) => {
        try {
            var dueDate = createTaskDetails.dueDate;
            var dueTime = createTaskDetails.dueTime;
            var dateMerged;
            if (dueDate && !dueTime) {
                dateMerged = endOfDay(dueDate);
            } else if (!dueDate && dueTime) {
                dateMerged = setDate(dueTime, getDate(new Date()))
            } else if (dueDate && dueTime) {
                dateMerged = new Date(dueDate.toDateString() + ' ' + dueTime.toTimeString())
            }
            
            if(dateMerged) {
                dateMerged = formatRFC3339(dateMerged);
            }

            const data = await taskService.createTask(createTaskDetails.taskName, createTaskDetails.priority, createTaskDetails.ownerId, createTaskDetails.tags, dateMerged);
            return { success: data }
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response.data as TaskError)
        }
    }
);

export const toggleTask = createAsyncThunk<TaskServiceResponse, CompleteTask, { rejectValue: TaskError }>(
    "task/complete",
    async (completeTaskDetails) => {
        const data = await taskService.toggleTask(completeTaskDetails.taskId);
        return { success: data }
    }
)

export const deleteTask = createAsyncThunk<TaskServiceResponse, DeleteTask, { rejectValue: TaskError }>(
    "task/delete",
    async (deleteTaskDetails) => {
        const data = await taskService.deleteTask(deleteTaskDetails.taskId);
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
                state.groupedTasks = action.payload.success;
                state.taskSliceSuccess = false;
            })
            .addCase(createTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = true;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = false;
            })
            .addCase(deleteTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = true;
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = false;
            })
            .addCase(toggleTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(toggleTask.fulfilled, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = true;
            })
            .addCase(toggleTask.rejected, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = false;
            })
    }
})

export default taskSlice.reducer;