import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box,
    Grid, Card, CardContent, Alert
} from '@mui/material';
import MovieService from '../services/movie.service';

const Movie = () => {
    const [movies, setMovies] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', releaseYear: '', genre: '', director: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const data = await MovieService.getAllMovies();
            setMovies(data);
        } catch (err) {
            setError('Ошибка загрузки фильмов');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await MovieService.addMovie({
                title: form.title,
                description: form.description,
                releaseYear: parseInt(form.releaseYear),
                genre: form.genre,
                director: form.director
            });

            setSuccess('Фильм успешно добавлен!');
            setForm({ title: '', description: '', releaseYear: '', genre: '', director: '' });
            loadMovies(); // перезагружаем список
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при добавлении');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>Добавить новый фильм</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Название" name="title" value={form.title} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Год" name="releaseYear" type="number" value={form.releaseYear} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Описание" name="description" multiline rows={3} value={form.description} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Жанр" name="genre" value={form.genre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Режиссёр" name="director" value={form.director} onChange={handleChange} />
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" sx={{ mt: 3 }}>Добавить фильм</Button>
                </Box>
            </Paper>

            <Typography variant="h5" gutterBottom>Список фильмов ({movies.length})</Typography>
            <Grid container spacing={3}>
                {movies.map(movie => (
                    <Grid item xs={12} sm={6} md={4} key={movie.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{movie.title} ({movie.releaseYear})</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {movie.genre} • {movie.director}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {movie.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Movie;