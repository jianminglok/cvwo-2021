import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useForm } from 'react-hook-form';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import NavBar from './NavBar'
import Alert from '@mui/material/Alert';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { signUp, UserSignUp } from '../features/authSlice';
import { RootState, useAppDispatch } from '../app/store';
import { Navigate, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';

export default function NewTask() {
    const loading = useSelector((state: RootState) => state.auth.value.status) === 'loading'

    const signUpError = useSelector((state: RootState) => state.auth.value.signUpError);
    const signUpSuccess = useSelector((state: RootState) => state.auth.value.signUpSuccess);

    const { register, handleSubmit, control, setError, watch, formState: { errors } } = useForm();

    const dispatch = useAppDispatch();

    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [timeValue, setTimeValue] = useState<Date | null>(null);

    const navigate = useNavigate();

    const onSubmit = (values: UserSignUp) => {
        /*
        dispatch(signUp(values))
            .unwrap()
            .then(() => {

            })
            .catch(() => {
            });;
        */
    };

    useEffect(() => {
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

                {signUpError && <Alert severity="error" sx={{ mt: 2 }}>{signUpError}</Alert>}
                {signUpSuccess &&
                    <Alert severity="success" sx={{ mt: 2 }}>
                        You may click the link below sign in to your newly created account
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
                            helperText={errors.taskName ? errors.taskName?.message : "Task Name"}
                            {...register("taskName", {
                                required: "Task Name",
                                maxLength: {
                                    value: 100,
                                    message: "Your last name must be at most 100 characters"
                                }
                            })}
                        />
                        <TextField
                            label="Email Address"
                            error={errors.email ? true : false}
                            helperText={errors.email ? "Please enter a valid email address" : "Please enter your email address"}
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            autoComplete="email"
                            {...register("email", {
                                required: true,
                                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                            })}
                        />
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <TextField
                                select
                                id="taskPriority"
                                label="Priority"
                                defaultValue=''
                                error={errors.taskPriority ? true : false}
                                helperText="Please select the task priority"
                                required
                                {...register("taskPriority", {
                                    required: true
                                })}
                            >
                                <MenuItem value='high'>High</MenuItem>
                                <MenuItem value='medium'>Medium</MenuItem>
                                <MenuItem value='low'>Low</MenuItem>
                            </TextField>
                        </FormControl>
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
                                        helperText="Please enter the task due date"
                                        id="dueDate"
                                        {...register("dueDate", {
                                        })}
                                    />
                                }
                            />
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="Due Time"
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
                                        helperText="Please enter the task due time"
                                        id="dueTime"
                                        {...register("dueTime", {
                                        })}
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
