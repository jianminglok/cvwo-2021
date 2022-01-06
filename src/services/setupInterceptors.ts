import axios, { AxiosResponse } from "axios";
import { signOut } from "../features/authSlice";
import { useAppDispatch } from "../app/store";
import { useState } from "react";
import { useNavigate } from "react-router";

const setupInterceptors = () => {

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const axiosService = axios.create();

    axios.interceptors.response.use(
        (res: AxiosResponse) => {
            return res;
        },
        async (err) => {
            const originalConfig = err.config;

            if (originalConfig.url != '/api/users/refreshtoken' && originalConfig.url != '/api/users/signout' && err.response) {
                if (err.response.status === 401 && !originalConfig._retry) {
                    originalConfig._retry = true;
                    try {
                        const rs = await axiosService.post("/api/users/refreshtoken");
                        if (rs.status === 201) {
                            return axios(originalConfig);
                        }
                    } catch (_error: any) {
                        dispatch(signOut())
                            .unwrap()
                            .then(() => {
                                navigate('/signin');
                            })
                            .catch(() => {
                            });
                        return Promise.reject(_error);
                    }
                }
            }
            return Promise.reject(err);
        }
    );
};

export default setupInterceptors;