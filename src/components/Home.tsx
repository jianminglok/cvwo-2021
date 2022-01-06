import { Container, CssBaseline, Typography } from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import Loading from "./Loading";
import NavBar from "./NavBar";

export default function Home() {

    const loading = useSelector((state: RootState) => state.auth.value.status) === 'loading'

    useEffect(() => {
        document.title = "Home"
        fetchData();
    }, []);

    const fetchData = () => {
        axios.get('/api/api-1').then((response) => {
            console.log(response.data)
        });
    }

    if (loading) {
        return (
            <Loading />
        )
    } else {
        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <NavBar />
                <Typography paragraph>
                    Home
                </Typography>
            </Container>
        )
    }
}