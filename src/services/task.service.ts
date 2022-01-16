import axios from "axios";

const getPlannedTasks = () => {
    return axios
        .get("/api/tasks/planned", {
        })
        .then((response) => {
            return response.data;
        })
};

const getTasks = (tag? : string, priority? : string, sortBy? : string, searchQuery? : string) => {
    var filter = '';

    if (typeof tag != 'undefined') {
        filter += '/tag/' + tag
    } else if (typeof priority != 'undefined') {
        filter += '/priority/' + priority
    } else if (typeof sortBy != 'undefined') {
        filter += '/sort/' + sortBy
    } else if (typeof searchQuery != 'undefined') {
        filter += '/search/' + searchQuery
    }

    return axios
        .get("/api/tasks" + filter, {
        })
        .then((response) => {
            return response.data;
        })
};

const getTask = (taskId: string) => {
    return axios
        .get("/api/tasks/" + taskId, {
        })
        .then((response) => {
            return response.data;
        })
};

const createTask = (name: string, priority: string, ownerId: string, tags?: string[], dueDateTime?: string) => {
    return axios
        .post("/api/tasks/create", {
            name,
            tags,
            priority,
            dueDateTime,
            ownerId
        })
        .then((response) => {
            return response.data;
        });
};

const editTask = (name: string, priority: string, ownerId: string, completed: boolean, taskId: string, tags?: string[], dueDateTime?: string) => {
    return axios
        .put("/api/tasks/" + taskId, {
            name,
            tags,
            completed,
            priority,
            dueDateTime,
            ownerId
        })
        .then((response) => {
            return response.data;
        });
};

const toggleTask = (taskId: string) => {
    return axios
        .put("/api/tasks/completed/" + taskId)
        .then((response) => {
            return response.data;
        })
};

const deleteTask = (taskId: string) => {
    return axios
        .delete("/api/tasks/" + taskId)
        .then((response) => {
            return response.data;
        })
};

const getTags = () => {
    return axios
        .get("/api/tasks/tags", {
        })
        .then((response) => {
            return response.data;
        })
};


const taskService = {
    getPlannedTasks,
    getTasks,
    getTask,
    createTask,
    editTask,
    toggleTask,
    deleteTask,
    getTags,
};

export default taskService;