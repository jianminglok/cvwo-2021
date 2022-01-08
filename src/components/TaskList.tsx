import { Alert, Checkbox, Chip, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../app/store";
import { getTasks, TaskObject, TaskFilters, GroupedTasks } from "../features/taskSlice";
import Loading from "./Loading";
import NavBar from "./NavBar";
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigate, useNavigate, useParams } from "react-router";
import { formatRelative, isAfter, isBefore, isSameDay, parseISO, subDays } from 'date-fns';
import { formatDistance, formatDistanceToNowStrict, intervalToDuration } from "date-fns";
import TaskItem from "./TaskItem";

export default function TaskList() {

    const loading = useSelector((state: RootState) => state.task.status) === 'loading';
    const groupedTasks = useSelector((state: RootState) => state.task.groupedTasks);

    const { tag, priority, sortBy, searchQuery } = useParams();

    const dispatch = useAppDispatch();

    var isChip = false;

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

    var currTime = new Date();

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
                    : groupedTasks && groupedTasks.length > 0
                        ?
                        <Stack sx={{ width: '100%' }} spacing={2}>
                            {groupedTasks &&
                                groupedTasks.map((taskGroup: GroupedTasks, index: number) => {

                                    const groupTitle = taskGroup.completed ? 'Completed' : 'To be Completed' + ' - ' + taskGroup.taskCount.toString() + ' Tasks'

                                    return (
                                        <Stack sx={{ width: '100%', mt: 3 }} key={index} spacing={2}>
                                            <Typography variant="h6">{groupTitle}</Typography>
                                            {taskGroup.items &&
                                                taskGroup.items.map((task: TaskObject, index: number) => {
                                                    return (
                                                        <TaskItem task={task} currTime={currTime} key={task.TaskID}/>
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