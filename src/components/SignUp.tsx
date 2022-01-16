import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { SubmitHandler, useForm } from 'react-hook-form';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import { signUp, UserSignUp } from '../features/authSlice';
import { RootState, useAppDispatch } from '../app/store';
import { Navigate, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Loading from './Loading';

export default function SignUp() {
    const loading = useSelector((state: RootState) => state.auth.value.status) === 'loading'

    const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
    const signUpError = useSelector((state: RootState) => state.auth.value.signUpError);
    const signUpSuccess = useSelector((state: RootState) => state.auth.value.signUpSuccess);

    const { register, handleSubmit, control, setError, watch, formState: { errors } } = useForm<UserSignUp>();

    const dispatch = useAppDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const handleMouseDownConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const password = useRef({});
    password.current = watch("password", "");

    const navigate = useNavigate();

    const onSubmit: SubmitHandler<UserSignUp> = (values) => {
        dispatch(signUp(values))
            .unwrap()
            .then(() => {

            })
            .catch(() => {
            });
    };

    useEffect(() => {
        document.title = "Sign Up"
    }, []);

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: { xs: 0, md: 8 },
                    marginBottom: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign Up
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
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    error={errors.firstName ? true : false}
                                    helperText={errors.firstName ? errors.firstName?.message : "First Name"}
                                    {...register("firstName", {
                                        required: "First Name",
                                        maxLength: {
                                            value: 100,
                                            message: "Your first name must be at most 100 characters"
                                        }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={6} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    autoComplete="family-name"
                                    error={errors.lastName ? true : false}
                                    helperText={errors.lastName ? errors.lastName?.message : "Last Name"}
                                    {...register("lastName", {
                                        required: "Last Name",
                                        maxLength: {
                                            value: 100,
                                            message: "Your last name must be at most 100 characters"
                                        }
                                    })}
                                />
                            </Grid>
                        </Grid>
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            error={errors.password ? true : false}
                            helperText={errors.password ? errors.password?.message : "Please enter your password"}
                            {...register("password", {
                                required: "Please enter your password",
                                minLength: {
                                    value: 8,
                                    message: "Your password must contain at least 8 characters"
                                }
                            })}
                            InputProps={{ // <-- This is where the toggle button is added.
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            autoComplete="false"
                            error={errors.confirmPassword ? true : false}
                            helperText={errors.confirmPassword ? errors.confirmPassword.message != '' ? errors.confirmPassword.message : "Please enter your password again" : "Please enter your password again"}
                            {...register("confirmPassword", {
                                required: true,
                                validate: value =>
                                    value === password.current || "Yours passwords do not match"
                            })}
                            InputProps={{ // <-- This is where the toggle button is added.
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirmPassword visibility"
                                            onClick={handleClickShowConfirmPassword}
                                            onMouseDown={handleMouseDownConfirmPassword}
                                        >
                                            {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>

                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link onClick={() => navigate('/signin')} variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                }
            </Box>
        </Container>
    );
}
