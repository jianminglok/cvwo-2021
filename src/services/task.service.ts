import axios from "axios";

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

const getPlannedTasks = () => {
    return axios
        .get("/api/tasks/planned", {
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

const signOut = () => {
    return axios
        .post("/api/users/signout")
        .then((response) => {
            if (response.data.success) {
                localStorage.removeItem("user");
            }
            return response.data;
        })
};

const taskService = {
    getTasks,
    getPlannedTasks,
    createTask,
    toggleTask,
    deleteTask,
    signOut,
};

export default taskService;