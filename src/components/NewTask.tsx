import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { SubmitHandler, useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { RootState, useAppDispatch } from '../app/store';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';
import { NewTaskDetails, createTask, TaskServiceResponse, TagOption, getTags } from '../features/taskSlice';
import { Autocomplete, Chip, Stack } from '@mui/material';

export default function NewTask() {
    const loading = useSelector((state: RootState) => state.task.status) === 'loading'

    const createTaskError = useSelector((state: RootState) => state.task.taskSliceError);
    const createTaskSuccess = useSelector((state: RootState) => state.task.taskSliceSuccess);
    const previousTags: TagOption[] = useSelector((state: RootState) => state.task.tags);

    const { register, handleSubmit, control, setError, watch, formState: { errors } } = useForm<NewTaskDetails>();

    const dispatch = useAppDispatch();

    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [timeValue, setTimeValue] = useState<Date | null>(null);

    const [tags, setTags] = useState<string[] | undefined>([]);

    const navigate = useNavigate();

    // Dispatch action to add a new task when submit button pressed
    const onSubmit: SubmitHandler<NewTaskDetails> = (values) => {
        values.tags = tags;
        if (dateValue) {
            values.dueDate = dateValue;
        }
        if (timeValue) {
            values.dueTime = timeValue;
        }
        values.ownerId = localStorage.getItem("user") || "";
        dispatch(createTask(values))
            .unwrap()
            .then((res: TaskServiceResponse) => {
                if (res.success != "") {
                    navigate('/')
                }
            })
            .catch(() => {
            });
    };

    useEffect(() => {
        dispatch(getTags())
        document.title = "New Task"
    }, []);

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
                    New Task
                </Typography>

                {createTaskError && <Alert severity="error" sx={{ mt: 2 }}>{createTaskError}</Alert>}
                {createTaskSuccess &&
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Your task has been created
                    </Alert>
                }

                {loading
                    ? <Loading />
                    : <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                        <TextField
                            required
                            fullWidth
                            id="taskName"
                            label="Task Name"
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
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <TextField
                                select
                                id="priority"
                                label="Priority"
                                defaultValue=''
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
                            Create Task
                        </Button>
                    </Box>
                }
            </Box>
        </Container>
    );
}
