import { Alert, Checkbox, Chip, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../app/store";
import { getTasks, TaskObject, TaskFilters, deleteTask, TaskServiceResponse, toggleTask, setDeleteTaskDetails } from "../features/taskSlice";
import Loading from "./Loading";
import NavBar from "./NavBar";
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigate, useNavigate, useParams } from "react-router";
import { formatRelative, isAfter, isBefore, isSameDay, parseISO, subDays } from 'date-fns';
import { formatDistance, formatDistanceToNowStrict, intervalToDuration } from "date-fns";
import { getPlannedTasks } from "../features/plannedTaskSlice";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import DeleteTaskDialog from "./DeleteTaskDialog";

interface TaskItemObject {
    task: TaskObject
    currTime: Date
    openDialog(): void;
}

export default function TaskItem({ task, currTime, openDialog }: TaskItemObject) {
    var isChip = false;

    const navigate = useNavigate();

    const labelId = `list-label-${task.TaskID}`;

    const dueTime = new Date(task.dueDateTime);

    const dispatch = useAppDispatch();

    const { tag, priority, sortBy, searchQuery } = useParams();

    const taskFilters: TaskFilters = {
        tag: tag,
        priority: priority,
        sortBy: sortBy,
        searchQuery: searchQuery
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>, navigateDest: string) => {
        if (event.currentTarget.nodeName === 'A') {
            isChip = true;
        }

        if (isChip && navigateDest.includes('/tasks/tag') || isChip && navigateDest.includes('/tasks/priority') || !isChip && navigateDest.includes('/task/')) {
            navigate(navigateDest);
        }
    }

    // Dispatch action to delete task
    const handleDelete = (taskName: string, taskId: string) => {
        openDialog();
        dispatch(setDeleteTaskDetails({taskName, taskId}));
    }

    // Dispatch action to toggle the completion status of task
    const handleComplete = (taskId: string) => {
        dispatch(toggleTask({ "taskId": taskId }))
            .unwrap()
            .then((res: TaskServiceResponse) => {
                if (res.success != "") {
                    if (window.location.href.includes('/tasks')) {
                        dispatch(getTasks(taskFilters));
                    } else {
                        dispatch(getPlannedTasks());
                    }
                }
            })
            .catch(() => {
            });
    }

    const capitalize = (words: string) => words[0].toUpperCase() + words.substring(1).toLowerCase();

    const timeDiffRel = formatRelative(
        dueTime,
        currTime,
        { weekStartsOn: 1 }
    );

    const dtString = 'Due ' + timeDiffRel;

    return (
        <Paper variant="outlined">
            <ListItem
                secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.name, task.TaskID)}>
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
                            checked={task.completed}
                            onChange={() => handleComplete(task.TaskID)}
                            inputProps={{ 'aria-labelledby': task.TaskID }}
                        />
                    </ListItemIcon>
                    <ListItemText
                        onClick={(e) => handleClick(e, '/task/' + task.TaskID)}
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
    )
}