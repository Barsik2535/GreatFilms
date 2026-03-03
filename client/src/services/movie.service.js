import axios from 'axios';

const API_URL = 'http://localhost:5108/api/movies';

class MovieService {
    async addMovie(movieData) {
        const response = await axios.post(API_URL +'/create', movieData);
        return response.data;
    }

    async getAllMovies() {
        const response = await axios.get(API_URL);
        return response.data;
    }
}

export default new MovieService();