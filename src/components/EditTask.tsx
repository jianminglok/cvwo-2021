import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { RootState, useAppDispatch } from '../app/store';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';
import { EditTaskDetails, editTask, getTask, SingleTaskDetail, TaskServiceResponse, TagOption, getTags } from '../features/taskSlice';
import { Autocomplete, Checkbox, Chip, FormControlLabel } from '@mui/material';

export default function EditTask() {
    const loading = useSelector((state: RootState) => state.task.status) === 'loading'

    const taskFetched = useSelector((state: RootState) => state.task.singleTask);
    const editTaskError = useSelector((state: RootState) => state.task.taskSliceError);
    const editTaskSuccess = useSelector((state: RootState) => state.task.taskSliceSuccess);
    const previousTags: TagOption[] = useSelector((state: RootState) => state.task.tags);

    const { register, handleSubmit, setValue, control, setError, watch, formState: { errors } } = useForm<EditTaskDetails>();

    const { taskId } = useParams();

    const dispatch = useAppDispatch();

    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [timeValue, setTimeValue] = useState<Date | null>(null);

    const [completed, setCompleted] = useState<boolean>(false);

    const [tags, setTags] = useState<string[] | undefined>([]);

    // Dispatch action to edit task when submit button pressed
    const onSubmit: SubmitHandler<EditTaskDetails> = (values) => {
        values.tags = tags;
        if (dateValue) {
            values.dueDate = dateValue;
        }
        if (timeValue) {
            values.dueTime = timeValue;
        }
        values.ownerId = localStorage.getItem("user") || "";
        values.completed = completed;
        values.taskId = taskFetched?.TaskID || "";

        dispatch(editTask(values))
            .unwrap()
            .then((res: TaskServiceResponse) => {
                if (res.success != "") {
                    dispatch(getTask(taskDetails));
                }
            })
            .catch(() => {
            });
    };

    const taskDetails: SingleTaskDetail = {
        taskId: taskId || ""
    }

    useEffect(() => {
        dispatch(getTask(taskDetails))
            .unwrap()
            .then(() => {
                dispatch(getTags());
            })
            .catch(() => {
            });;
        document.title = "Edit Task";
    }, [dispatch, taskId]);

    useEffect(() => {
        if (taskFetched) {
            setTags(taskFetched.tags);
            setCompleted(taskFetched.completed);
            setDateValue(new Date(taskFetched.dueDateTime));
            setTimeValue(new Date(taskFetched.dueDateTime));
        }
    }, [taskFetched]);

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 8,
                }}
            >
                <Typography component="h1" variant="h5">
                    Edit Task
                </Typography>

                {editTaskError && <Alert severity="error" sx={{ mt: 2 }}>{editTaskError}</Alert>}
                {editTaskSuccess &&
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Your task has been edited
                    </Alert>
                }

                {loading
                    ? <Loading />
                    : taskFetched && taskFetched.TaskID != ""
                        ?
                        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                            <FormControlLabel control={<Checkbox checked={completed} onChange={(e) => setCompleted(e.target.checked)} />} label={completed ? "Completed" : "Not completed"} sx={{ mb: 2 }}/>
                            <Controller
                                name="taskName"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField
                                        required
                                        fullWidth
                                        id="taskName"
                                        label="Task Name"
                                        defaultValue={taskFetched.name}
                                        error={errors.taskName ? true : false}
                                        helperText={errors.taskName ? errors.taskName?.message : "Please enter a task name"}
                                        {...register("taskName", {
                                            required: "Task Name",
                                            maxLength: {
                                                value: 100,
                                                message: "Your task name must be at most 100 characters"
                                            }
                                        })}
                                    />
                                )}

                            />
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <TextField
                                            select
                                            id="priority"
                                            label="Priority"
                                            defaultValue={taskFetched.priority}
                                            error={errors.priority ? true : false}
                                            helperText="Please select the task priority"
                                            required
                                            {...register("priority", {
                                                required: true
                                            })}
                                        >
                                            <MenuItem value='high'>High</MenuItem>
                                            <MenuItem value='medium'>Medium</MenuItem>
                                            <MenuItem value='low'>Low</MenuItem>
                                        </TextField>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        value={tags}
                                        onChange={(event, newValue) => {
                                            setTags(newValue.map(str => str.replace(/\s/g, '')));
                                        }}
                                        multiple
                                        options={previousTags.map((option: TagOption) => option.name)}
                                        freeSolo
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                id="tags"
                                                placeholder="Tags"
                                                fullWidth
                                                margin="normal"
                                                helperText="You may add tags by pressing the enter key after each tag"

                                            />
                                        )}
                                    />
                                )}

                            />
                            <Controller
                                name="dueDate"
                                control={control}
                                defaultValue={new Date(0)}
                                render={({ field: { onChange, value } }) => (
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Due Date"
                                            value={dateValue}
                                            onChange={(newValue) => {
                                                setDateValue(newValue);
                                            }}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    error={errors.dueDate ? true : false}
                                                    fullWidth
                                                    margin="normal"
                                                    helperText="You may enter a task due date"
                                                    id="dueDate"
                                                />
                                            }
                                        />
                                    </LocalizationProvider>
                                )}

                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker
                                    label="Due Time"
                                    ampm={false}
                                    openTo="hours"
                                    views={['hours', 'minutes', 'seconds']}
                                    inputFormat="HH:mm:ss"
                                    mask="__:__:__"
                                    value={timeValue}
                                    onChange={(newValue) => {
                                        setTimeValue(newValue);
                                    }}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            error={errors.dueTime ? true : false}
                                            fullWidth
                                            margin="normal"
                                            helperText="You may enter a task due time"
                                            id="dueTime"
                                        />
                                    }
                                />
                            </LocalizationProvider>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Edit Task
                            </Button>
                        </Box>
                        :
                        <Alert severity="error" sx={{ mt: 2 }}>Task cannot be found</Alert>
                }
            </Box>
        </Container>
    );
}
