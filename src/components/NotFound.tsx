import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import { Link } from '@mui/material';

export default function NotFound() {

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Page Not Found"
    }, [])

    return (
        <Container>
            <Box
                sx={{
                    marginTop: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    It seems that you are lost.
                </Typography>

                <Link onClick={() => navigate('/')}>Go Back to Home</Link>

            </Box>
        </Container>
    )
}