import { Alert, Checkbox, Chip, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useEffect } from "react";
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

export default function PlannedList() {

    const loading = useSelector((state: RootState) => state.plannedTask.status) === 'loading'
    const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
    const plannedTasks = useSelector((state: RootState) => state.plannedTask.plannedTasks);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    var isChip = false;

    const handleClick = (event: React.MouseEvent<HTMLElement>, navigateDest: string) => {
        if (event.currentTarget.nodeName === 'A') {
            isChip = true;
        }

        if (isChip && navigateDest.includes('/tasks/tag') || isChip && navigateDest.includes('/tasks/priority') || !isChip && navigateDest.includes('/task/')) {
            navigate(navigateDest);
        }
    }

    const capitalize = (words: string) => words[0].toUpperCase() + words.substring(1).toLowerCase();

    useEffect(() => {
        dispatch(getPlannedTasks());
        document.title = "Planned";
    }, [dispatch]);

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

                {loading
                    ? <Loading />
                    : plannedTasks && plannedTasks.length > 0
                        ?
                        <Stack sx={{ width: '100%' }} spacing={2}>
                            {plannedTasks &&
                                plannedTasks.map((taskGroup: PlannedTask, index: number) => {

                                    const dueDate = taskGroup.Due;
                                    //dueDate.setDate(dueDate.getDate());

                                    const dateGroupTitle = dueDate == 0 ? 'Today' : dueDate == 1 ? 'Tomorrow' : dueDate == 2 ? 'Next 7 Days' : dueDate == 3 ? 'Later this Month' : 'Future';

                                    //const notExpired = isAfter(dueDate, new Date().setHours(0, 0, 0));

                                    return (
                                        <Stack sx={{ width: '100%', mt: 3 }} key={index} spacing={2}>
                                            <Typography variant="h6">{dateGroupTitle + ' - ' + taskGroup.taskCount.toString() + ' ' + (taskGroup.taskCount > 1 ? 'tasks' : 'task') + ' due'}</Typography>
                                            {taskGroup.items &&
                                                taskGroup.items.map((task: TaskObject, index: number) => {
                                                    const labelId = `list-label-${task.ID}`;

                                                    const dueTime = new Date(task.dueDateTime);
                                                    var currTime = new Date();

                                                    const timeDur = intervalToDuration({
                                                        start: currTime,
                                                        end: dueTime,
                                                    });

                                                    const timeDiff = formatDistanceToNowStrict(
                                                        dueTime,
                                                        { addSuffix: true }
                                                    );

                                                    const timeDiffRel = formatRelative(
                                                        dueTime,
                                                        currTime,
                                                        { weekStartsOn: 1 }
                                                    );

                                                    //const days = typeof timeDur.days === 'undefined' ? 0 : timeDur.days;
                                                    //const dtString = 'Due ' + (days == 0 || days > 7 ? timeDiff : timeDiffRel);
                                                    const dtString = 'Due ' + timeDiffRel;

                                                    return (
                                                        <Paper variant="outlined" key={task.ID}>
                                                            <ListItem
                                                                secondaryAction={
                                                                    <IconButton edge="end" aria-label="delete">
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                }
                                                                disablePadding
                                                            >
                                                                <ListItemButton role={undefined} dense>
                                                                    <ListItemIcon>
                                                                        <Checkbox
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            inputProps={{ 'aria-labelledby': task.ID }}
                                                                        />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        onClick={(e) => handleClick(e, '/task/' + task.ID)}
                                                                        id={labelId}
                                                                        primary={
                                                                            <Grid
                                                                                container
                                                                                direction="row"
                                                                                justifyContent="flex-start"
                                                                                alignItems="center"
                                                                                spacing={1.5}>
                                                                                <Grid item>
                                                                                    <Typography variant="subtitle1">{task.name}</Typography>
                                                                                </Grid>
                                                                                <Grid item>
                                                                                    <Chip label={capitalize(task.priority)} color={task.priority == "high" ? "error" : task.priority == "medium" ? "warning" : "success"} size="small" sx={{ my: 1 }} component="a" onClick={(e: React.MouseEvent<HTMLElement>) => handleClick(e, '/tasks/priority/' + task.priority)} clickable />
                                                                                </Grid>
                                                                            </Grid>
                                                                        }
                                                                        secondary={
                                                                            <Box>
                                                                                <Grid
                                                                                    container
                                                                                    direction="row"
                                                                                    justifyContent="flex-start"
                                                                                    alignItems="center"
                                                                                    spacing={1}>
                                                                                    <Grid item>
                                                                                        <Typography variant="body2">{dtString}</Typography>
                                                                                    </Grid>
                                                                                </Grid>
                                                                                <Grid
                                                                                    container
                                                                                    direction="row"
                                                                                    justifyContent="flex-start"
                                                                                    alignItems="center"
                                                                                    rowSpacing={0.5}
                                                                                    columnSpacing={0.75}
                                                                                    sx={{ my: 1 }} >
                                                                                    {task &&
                                                                                        task.tags.map((tag: string, index) => {
                                                                                            return (
                                                                                                <Grid item key={index}>
                                                                                                    <Chip label={tag} component="a" onClick={(e: React.MouseEvent<HTMLElement>) => handleClick(e, '/tasks/tag/' + tag)} clickable />
                                                                                                </Grid>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </Grid>
                                                                            </Box>
                                                                        }
                                                                    />
                                                                </ListItemButton>
                                                            </ListItem>
                                                        </Paper>
                                                    );
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