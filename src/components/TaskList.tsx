import { Alert, Checkbox, Chip, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../app/store";
import { getTasks, TaskObject, TaskFilters } from "../features/taskSlice";
import Loading from "./Loading";
import NavBar from "./NavBar";
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigate, useNavigate, useParams } from "react-router";
import { formatRelative, isAfter, isBefore, isSameDay, parseISO, subDays } from 'date-fns';
import { formatDistance, formatDistanceToNowStrict, intervalToDuration } from "date-fns";
import CircularProgress from '@mui/material/CircularProgress';

export default function TaskList() {

    const loading = useSelector((state: RootState) => state.task.status) === 'loading'
    const signedIn = useSelector((state: RootState) => state.auth.value.signedIn);
    const tasks = useSelector((state: RootState) => state.task.tasks);

    const { tag, priority, sortBy, searchQuery } = useParams();

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

    const taskFilters: TaskFilters = {
        tag: tag,
        priority: priority,
        sortBy: sortBy,
        searchQuery: searchQuery
    }

    useEffect(() => {
        dispatch(getTasks(taskFilters));
        document.title = "Tasks";
    }, [dispatch, tag, priority, sortBy, searchQuery]);

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 8
                }}
            >

                <Typography variant="h5">{tag ? 'Tasks Tagged ' + tag : priority ? capitalize(priority) + ' Priority Tasks' : searchQuery ? 'Search Tasks' : 'All Tasks'}</Typography>

                {loading 
                    ? <Loading />
                    : tasks && tasks.length > 0
                        ?
                        <Stack sx={{ width: '100%', mt: 3 }} spacing={2}>
                            {tasks &&
                                tasks.map((task: TaskObject, index) => {
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
                        :
                        <Alert severity="info" sx={{ mt: 2 }}>No tasks found / added yet</Alert>
                }

            </Box>
        </Container>
    )
}