import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import Home from './components/Home';
import { createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import SignUp from './components/SignUp';
import NotFound from './components/NotFound';
import { RootState, useAppDispatch } from './app/store';
import setupAxiosInterceptors from './services/setupInterceptors';
import { signOut } from './features/authSlice';
import setupInterceptors from './services/setupInterceptors';
import TaskList from './components/TaskList';
import { useSelector } from 'react-redux';
import PlannedList from './components/PlannedList';
import NewTask from './components/NewTask';
import Fab from '@mui/material/Fab';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useNavigate } from 'react-router';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { useLocation } from 'react-router';
import NavBar from './components/NavBar';

interface ProtectedRouteObject {
  children: ReactJSXElement
}

function RequireAuth({ children }: ProtectedRouteObject) {
  const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
  return signedIn ? children : <Navigate to="/signin" />;
}

function PreviousRoute({ children }: ProtectedRouteObject) {
  const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
  return !signedIn ? children : <Navigate to="/" />;
}

export default function App() {

  setupInterceptors();

  const dispatch = useAppDispatch();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const navigate = useNavigate();

  const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <div className="app">
      <ThemeProvider theme={theme}>

        <Container component="main">
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <NavBar />
            <Routes>
              <Route path="/" element={<RequireAuth><TaskList /></RequireAuth>} />
              <Route path="/tasks/new" element={<RequireAuth><NewTask /></RequireAuth>} />
              <Route path="/tasks/planned" element={<RequireAuth><PlannedList /></RequireAuth>} />
              <Route path="/tasks/tag/:tag" element={<RequireAuth><TaskList /></RequireAuth>} />
              <Route path="/tasks/priority/:priority" element={<RequireAuth><TaskList /></RequireAuth>} />
              <Route path="/tasks/sort/:sortBy" element={<RequireAuth><TaskList /></RequireAuth>} />
              <Route path="/tasks/search/:searchQuery" element={<RequireAuth><TaskList /></RequireAuth>} />
              <Route path="/signin" element={<PreviousRoute><SignIn /></PreviousRoute>} />
              <Route path="/signup" element={<PreviousRoute><SignUp /></PreviousRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Container>

        {signedIn &&
          <Fab
            color="primary"
            style={{
              position: 'fixed', bottom: theme.spacing(4),
              right: theme.spacing(4)
            }}
            onClick={() => navigate('/tasks/new')}
          >
            <AddTaskIcon />
          </Fab>}
      </ThemeProvider>
    </div>

  );
}
