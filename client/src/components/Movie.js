import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box,
    Grid, Card, CardContent, Alert
} from '@mui/material';
import MovieService from '../services/movie.service';
import ModalEdit from './ModalEdit'
const Movie = () =>
{
    const [movies, setMovies] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', releaseYear: '', genre: '', movieId: '',
        
    });
    const [modalActive, setModalActive] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [editForm, setEditForm] = useState({
        movieId: '', newTitle: '', newDescription: '', newReleaseYear: '', newGenre: ''
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
    const OpenMovie = (movie) => {
        setSelectedMovie(movie);
        setEditForm({
            movieId: movie.id,
            newTitle: movie.title,
            newDescription: movie.description,
            newReleaseYear: movie.releaseYear,
            newGenre: movie.genre
        })
        setModalActive(true);
    }
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleDelete = async(id) => {
        try {
            await MovieService.delete(id);
            loadMovies();
        }
        catch(err) {
            setError(err.response?.data?.message || 'Ошибка при удалении');
        }
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });
    };
    const handleEdit = async (e) => {
        e.preventDefault();
        try {
      
            await MovieService.editMovie(editForm.movieId,
                {
                    title: editForm.newTitle,
                    description: editForm.newDescription,
                    releaseYear: parseInt(editForm.newReleaseYear),
                    genre: editForm.newGenre,
           
                });

            setSuccess('Фильм отредактирован!');
            setModalActive(false);
            setForm({ newTitle: '', newDescription: '', newReleaseYear: '', newGenre: '', });
            loadMovies(); // перезагружаем список
        }

        catch (err) {
            setError(err.response?.data?.message || 'Ошибка при редактировании');
        }
    }


    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await MovieService.addMovie({
                title: form.title,
                description: form.description,
                releaseYear: parseInt(form.releaseYear),
                genre: form.genre
            });

            setSuccess('Фильм успешно добавлен!');
            setForm({ title: '', description: '', releaseYear: '', genre: '',});
            loadMovies(); // перезагружаем список
        }

        catch (err)
        {
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
                                <Typography variant="h4">{movie.title}</Typography>
                                <Typography variant="h6">Год выпуска: {movie.releaseYear}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                   Жанр: {movie.genre}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                Описание:
                                    {movie.description}
                                </Typography>
                                
                                <button onClick={() => OpenMovie(movie)}>Редактировать</button>
                                <button style={{ marginLeft: '50px' }} onClick={()=>handleDelete(movie.id)}>Удалить</button>
                            </CardContent>
                        </Card>
                    </Grid>

                ))}
            </Grid>

            <ModalEdit active={modalActive} setActive={setModalActive}>
                {selectedMovie && (<Box component="form" onSubmit={handleEdit}>
                    <Grid container spacing={2}>
                    
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Название" name="newTitle" value={editForm.newTitle} onChange={handleEditChange} required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Год" name="newReleaseYear" type="number" value={editForm.newReleaseYear} onChange={handleEditChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Описание" name="newDescription" multiline rows={3} value={editForm.newDescription} onChange={handleEditChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Жанр" name="newGenre" value={editForm.newGenre} onChange={handleEditChange} />
                        </Grid>

                    </Grid>
                    <Button type="submit" variant="contained" sx={{ mt: 3 }}>Редактировать фильм</Button>
                </Box>)}
            </ModalEdit>
        </Container>
    );
};
export default Movie;