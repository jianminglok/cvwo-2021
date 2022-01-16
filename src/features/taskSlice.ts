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
    singleTask?: TaskObject
    taskSliceError?: Object
    taskSliceSuccess?: boolean
    tags: TagOption[]
    deleteTaskDetails: SetDeleteTaskDetails
}

export interface TaskFilters {
    tag?: string
    priority?: string
    sortBy?: string
    searchQuery?: string
}

export interface TaskState {
    value: Task
}

interface GetTasksResponse {
    success: GroupedTasks[]
    error?: Object
}

interface GetTaskResponse {
    success: TaskObject
    error?: Object
}

export interface SingleTaskDetail {
    taskId: string
}

export interface NewTaskDetails {
    taskName: string
    tags?: any
    priority: string
    dueDate?: Date
    dueTime?: Date
    ownerId: string
}

export interface EditTaskDetails {
    taskName: string
    priority: string
    completed: boolean
    taskId: string
    tags?: any
    dueDate?: Date
    dueTime?: Date
    ownerId: string
}

export interface SetDeleteTaskDetails {
    taskName: string
    taskId: string
}

export interface TaskServiceResponse {
    success: Object
    error?: Object
}

interface TaskError {
    error: Object
}

export interface TagOption {
    name: string;
}

interface GetTagsResponse {
    success: TagOption[]
    error?: Object
}

const initialState: Task = {
    groupedTasks: [],
    status: 'idle',
    deleteTaskDetails: {
        taskName: "",
        taskId: ""
    },
    tags: []
}

export const getTasks = createAsyncThunk<GetTasksResponse, TaskFilters, { rejectValue: TaskError }>(
    "task/get",
    async (taskFilters) => {
        const data = await taskService.getTasks(taskFilters.tag, taskFilters.priority, taskFilters.sortBy, taskFilters.searchQuery);
        return { success: data }
    }
)

export const getTask = createAsyncThunk<GetTaskResponse, SingleTaskDetail, { rejectValue: TaskError }>(
    "task/getOne",
    async (getTaskDetails) => {
        const data = await taskService.getTask(getTaskDetails.taskId);
        return { success: data }
    }
)

export const createTask = createAsyncThunk<TaskServiceResponse, NewTaskDetails, { rejectValue: TaskError }>(
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

export const editTask = createAsyncThunk<TaskServiceResponse, EditTaskDetails, { rejectValue: TaskError }>(
    "task/edit",
    async (editTaskDetails, thunkAPI) => {
        try {
            var dueDate = editTaskDetails.dueDate;
            var dueTime = editTaskDetails.dueTime;
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

            const data = await taskService.editTask(editTaskDetails.taskName, editTaskDetails.priority, editTaskDetails.ownerId, editTaskDetails.completed, editTaskDetails.taskId, editTaskDetails.tags, dateMerged);
            return { success: data }
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response.data as TaskError)
        }
    }
);

export const toggleTask = createAsyncThunk<TaskServiceResponse, SingleTaskDetail, { rejectValue: TaskError }>(
    "task/toggle",
    async (toggleTaskDetails) => {
        const data = await taskService.toggleTask(toggleTaskDetails.taskId);
        return { success: data }
    }
)

export const deleteTask = createAsyncThunk<TaskServiceResponse, SingleTaskDetail, { rejectValue: TaskError }>(
    "task/delete",
    async (deleteTaskDetails) => {
        const data = await taskService.deleteTask(deleteTaskDetails.taskId);
        return { success: data }
    }
)

export const setDeleteTaskDetails = createAsyncThunk(
    "task/setDeleteTaskId",
    ({taskName, taskId }: SetDeleteTaskDetails) => {
        return { taskDetails: { taskName, taskId } }
    }
)

export const getTags = createAsyncThunk<GetTagsResponse, void, { rejectValue: TaskError }>(
    "task/getTags",
    async () => {
        const data = await taskService.getTags();
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
            .addCase(getTasks.fulfilled, (state, action) => {
                state.status = 'idle';
                state.groupedTasks = action.payload.success;
            })
            .addCase(getTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getTask.fulfilled, (state, action) => {
                state.status = 'idle';
                state.singleTask = action.payload.success;
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
            .addCase(editTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(editTask.fulfilled, (state, action) => {
                state.status = 'idle';
                state.taskSliceError = action.payload?.error;
                state.taskSliceSuccess = true;
            })
            .addCase(editTask.rejected, (state, action) => {
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
            .addCase(setDeleteTaskDetails.fulfilled, (state, action) => {
                state.deleteTaskDetails = action.payload.taskDetails;
            })
            .addCase(getTags.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getTags.fulfilled, (state, action) => {
                state.status = 'idle';
                state.tags = action.payload.success;
            })
    }
})

export default taskSlice.reducer;