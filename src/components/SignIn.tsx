import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { signIn, UserSignIn } from "../features/authSlice";
import { RootState, useAppDispatch } from "../app/store";

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import { useNavigate, Navigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Alert } from "@mui/material";
import Loading from "./Loading";

export default function SignIn() {

    const loading = useSelector((state: RootState) => state.auth.value.status) === 'loading'
    const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
    const signInError = useSelector((state: RootState) => state.auth.value.signInError);

    const dispatch = useAppDispatch();

    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const { register, handleSubmit, control, setError, formState: { errors } } = useForm();

    const navigate = useNavigate();

    const onSubmit = (values: UserSignIn) => {
        dispatch(signIn(values))
            .unwrap()
            .then(() => {
                navigate('/')
            })
            .catch(() => {
            });;
    };

    useEffect(() => {
        document.title = "Sign In"
    }, []);

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: { xs: 0, md: 8 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>

                {signInError && <Alert severity="error" sx={{ mt: 2 }}>{signInError}</Alert>}

                { loading 
                    ? <Loading />
                    :
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                        <TextField
                            label="Email Address"
                            error={errors.email ? true : errors.apiError ? true : false}
                            helperText={errors.email ? "Please enter a valid email address" : "Please enter your email address"}
                            margin="normal"
                            fullWidth
                            id="email"
                            autoComplete="email"
                            autoFocus
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
                            error={errors.password ? true : errors.apiError ? true : false}
                            helperText="Please enter your password"
                            {...register("password", {
                                required: true
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link onClick={() => navigate('/forgotpassword')} variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link onClick={() => navigate('/signup')} variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                }
            </Box>
        </Container>
    )

};
