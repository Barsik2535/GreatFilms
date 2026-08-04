import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Movie from './Movie';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    AppBar,
    Toolbar,
    Avatar
} from '@mui/material';
import AuthService from '../services/auth.service';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        <Link to="/dashboard">Main page</Link>
                        
                    </Typography>
                    <Typography variant="h6" sx={{ flexGrow: 1}}>
                        <Link to="/chat">Discuss</Link>

                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography>{user.email}</Typography>
                        <Avatar>{user.email?.charAt(0).toUpperCase()}</Avatar>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome, {user.email}!
                    </Typography>
                    <Typography variant="body1">
                        This is your protected dashboard. You are successfully authenticated.
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6">User Information:</Typography>
                        <Typography>User ID: {user.userId}</Typography>
                        <Typography>Email: {user.email}</Typography>
                        <Typography>Token: {user.token?.substring(0, 20)}...</Typography>
                    </Box>
                    <Movie />
                </Paper>
            </Container>
        </>
    );
};

export default Dashboard;