import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Grid
} from '@mui/material';
import AuthService from '../services/auth.service';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username:'',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) =>
    {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await AuthService.register(
                formData.email,
                formData.password,
                formData.confirmPassword,
                formData.firstName,
                formData.lastName,
                formData.username
            );

            if (response.isSuccess) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';

            if (error.response?.data) {
                const data = error.response.data;
                // Если есть объект errors с полями → собираем все сообщения
                if (data.errors && typeof data.errors === 'object') {
                    const messages = Object.values(data.errors).flat(); // объединяем все массивы ошибок
                    errorMessage = messages.join(', ');
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        
        
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Register
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                    required
                                />
                            </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>

                        <Box textAlign="center">
                            <Link to="/login">
                                Already have an account? Login
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;