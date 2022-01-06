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

const signIn = (email: string, password: string) => {
    return axios
        .post("/api/users/signin", {
            email,
            password,
        })
        .then((response) => {
            if (response.data.success) {
                localStorage.setItem("user", JSON.stringify(response.data.user_id));
            }
            return response.data;
        });
};

const signOut = () => {
    axios
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
    signIn,
    signOut,
};

export default taskService;