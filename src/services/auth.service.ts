import axios from "axios";

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

const signUp = (firstName: string, lastName: string, email: string, password: string) => {
  return axios
    .post("/api/users/signup", {
      firstName,
      lastName,
      email,
      password,
    })
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

const authService = {
  signIn,
  signUp,
  signOut,
};

export default authService;