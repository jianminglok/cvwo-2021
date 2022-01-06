import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import authService from "../services/auth.service";

const user = localStorage.getItem("user") || "";

interface User {
    userId: string
    signedIn: boolean
    signInError?: Object
    signUpError?: Object
    signUpSuccess?: boolean
    status: 'idle' | 'loading'
}

interface SignInResponse {
    userId: string
}

export interface UserSignIn {
    email: string
    password: string
}

interface SignUpResponse {
    success: Object
    error?: Object
}

export interface UserSignUp {
    firstName: string
    lastName: string
    email: string
    password: string
}

interface AuthError {
    error: Object
}

export interface UserState {
    value: User
}

const initialState: UserState = user != "" ? {
    value: {
        userId: user,
        signedIn: true,
        status: 'idle'
    }
} : {
    value: {
        userId: "",
        signedIn: false,
        status: 'idle'
    }
}

export const signUp = createAsyncThunk<SignUpResponse, UserSignUp, { rejectValue: AuthError }>(
    "auth/signup",
    async (signUpDetails, thunkAPI) => {
        try {
            const data = await authService.signUp(signUpDetails.firstName, signUpDetails.lastName, signUpDetails.email, signUpDetails.password);
            return { success: data }
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response.data as AuthError)
        }
    }
);

export const signIn = createAsyncThunk<SignInResponse, UserSignIn, { rejectValue: AuthError }>(
    "auth/signin",
    async (signInDetails, thunkAPI) => {
        try {
            const data = await authService.signIn(signInDetails.email, signInDetails.password);
            return { userId: data }
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response.data as AuthError)
        }
    }
);

export const signOut = createAsyncThunk(
    "auth/signout",
    async () => {
        await authService.signOut();
    }
);

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(signIn.pending, (state) => {
                state.value.status = 'loading';
            })
            .addCase(signIn.fulfilled, (state, action: PayloadAction<SignInResponse>) => {
                state.value.status = 'idle';
                state.value.signedIn = true;
                state.value.userId = action.payload.userId;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.value.status = 'idle';
                state.value.signedIn = false;
                state.value.userId = "";
                state.value.signInError = action.payload?.error;
            })
            .addCase(signUp.pending, (state) => {
                state.value.status = 'loading';
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.value.status = 'idle';
                state.value.signedIn = false;
                state.value.signUpError = action.payload?.error;
                state.value.signUpSuccess = true;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.value.status = 'idle';
                state.value.signedIn = false;
                state.value.signUpError = action.payload?.error;
                state.value.signUpSuccess = false;
            })
            .addCase(signOut.pending, (state) => {
                state.value.status = 'loading';
            })
            .addCase(signOut.fulfilled, (state) => {
                state.value.status = 'idle';
                state.value.signedIn = false;
                state.value.userId = "";
            })
    }
})

export default authSlice.reducer;