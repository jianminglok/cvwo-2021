import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import { createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import SignUp from './components/SignUp';
import NotFound from './components/NotFound';
import { RootState } from './app/store';
import setupInterceptors from './services/setupInterceptors';
import TaskList from './components/TaskList';
import { useSelector } from 'react-redux';
import PlannedList from './components/PlannedList';
import NewTask from './components/NewTask';
import Fab from '@mui/material/Fab';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useNavigate } from 'react-router';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import NavBar from './components/NavBar';
import EditTask from './components/EditTask';

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

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

export default function App() {

  setupInterceptors();

  const [mode, setMode] = React.useState(localStorage.getItem("prefersDarkTheme"));

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        localStorage.setItem("prefersDarkTheme", mode === 'dark' ? 'light' : 'dark');
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const navigate = useNavigate();

  const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode === 'dark' ? 'dark' : 'light',
        },
      }),
    [mode],
  );

  return (
    <div className="app">
      <ColorModeContext.Provider value={colorMode}>
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
                <Route path="/" element={<RequireAuth><PlannedList /></RequireAuth>} />
                <Route path="/tasks" element={<RequireAuth><TaskList /></RequireAuth>} />
                <Route path="/tasks/new" element={<RequireAuth><NewTask /></RequireAuth>} />
                <Route path="/task/:taskId" element={<RequireAuth><EditTask /></RequireAuth>} />
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
      </ColorModeContext.Provider>
    </div>

  );
}
