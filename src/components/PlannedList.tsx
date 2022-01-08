import { Alert, Checkbox, Chip, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../app/store";
import { TaskObject } from "../features/taskSlice";
import Loading from "./Loading";
import NavBar from "./NavBar";
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigate, useNavigate, useParams } from "react-router";
import { formatRelative, isAfter, isBefore, isSameDay, isTomorrow, parseISO, subDays } from 'date-fns';
import { formatDistance, formatDistanceToNowStrict, intervalToDuration } from "date-fns";
import { getPlannedTasks, PlannedTask } from "../features/plannedTaskSlice";
import { isToday } from "date-fns/esm";
import TaskItem from "./TaskItem";
import DeleteTaskDialog from "./DeleteTaskDialog";

export default function PlannedList() {

    const loading = useSelector((state: RootState) => state.plannedTask.status) === 'loading';
    const plannedTasks = useSelector((state: RootState) => state.plannedTask.plannedTasks);
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const [dialogIsOpen, setDialogIsOpen] = useState(false)

    const openDialog = () => {
        setDialogIsOpen(true)
    }

    const closeDialog = () => setDialogIsOpen(false)

    useEffect(() => {
        dispatch(getPlannedTasks());
        document.title = "Planned";
    }, [dispatch]);

    var currTime = new Date();

    return (
        <Container component="main">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    mb: 8
                }}
            >

                <Typography variant="h5">Planned</Typography>

                <DeleteTaskDialog open={dialogIsOpen} onClose={closeDialog} />

                {loading
                    ? <Loading />
                    : plannedTasks && plannedTasks.length > 0
                        ?
                        <Stack sx={{ width: '100%' }} spacing={2}>
                            {plannedTasks &&
                                plannedTasks.map((taskGroup: PlannedTask, index: number) => {

                                    const dueDate = taskGroup.due;
                                    //dueDate.setDate(dueDate.getDate());

                                    const dateGroupTitle = dueDate == 0 ? 'Today' : dueDate == 1 ? 'Tomorrow' : dueDate == 2 ? 'Next 7 Days' : dueDate == 3 ? 'Later this Month' : 'Future';

                                    //const notExpired = isAfter(dueDate, new Date().setHours(0, 0, 0));

                                    return (
                                        <Stack sx={{ width: '100%', mt: 3 }} key={index} spacing={2}>
                                            <Typography variant="h6">{dateGroupTitle + ' - ' + taskGroup.taskCount.toString() + ' ' + (taskGroup.taskCount > 1 ? 'tasks' : 'task') + ' due'}</Typography>
                                            {taskGroup.items &&
                                                taskGroup.items.map((task: TaskObject, index: number) => {
                                                    return (
                                                        <TaskItem task={task} currTime={currTime} openDialog={openDialog} key={task.TaskID}/>
                                                    )
                                                })}
                                        </Stack>
                                    );
                                })}
                        </Stack>
                        :
                        <Alert severity="info" sx={{ mt: 2 }}>No tasks found / added yet</Alert>
                }

            </Box>
        </Container>
    )
}