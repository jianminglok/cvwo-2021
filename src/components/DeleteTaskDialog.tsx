import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../app/store';
import { deleteTask, getTasks, TaskFilters, TaskServiceResponse } from '../features/taskSlice';
import { getPlannedTasks } from '../features/plannedTaskSlice';
import { useParams } from 'react-router';

interface DialogProps {
  open: boolean;
  onClose(): void;
}

export default function DeleteTaskDialog({ open, onClose }: DialogProps) {

  const taskDetails = useSelector((state: RootState) => state.task.deleteTaskDetails);

  const dispatch = useAppDispatch();

  const { tag, priority, sortBy, searchQuery } = useParams();

  const taskFilters: TaskFilters = {
    tag: tag,
    priority: priority,
    sortBy: sortBy,
    searchQuery: searchQuery
  }

  // Dispatch action to delete task with its ID 
  const handleDelete = (taskId: string) => {
    dispatch(deleteTask({ "taskId": taskId }))
      .unwrap()
      .then((res: TaskServiceResponse) => {
        if (res.success != "") {
          onClose();
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

  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Task
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {'Task "' + taskDetails.taskName + '" will be permanently deleted'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Disagree</Button>
          <Button onClick={() => handleDelete(taskDetails.taskId)} autoFocus color="error">
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}