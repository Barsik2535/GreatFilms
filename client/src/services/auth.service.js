import axios from 'axios';

const API_URL = 'http://localhost:5108/api/auth/';

class AuthService {
    async login(email, password, rememberMe) {
        try {
            const response = await axios.post(API_URL + 'login', {
                email,
                password,
                rememberMe
            });

            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async register(email, password, confirmPassword, firstName, lastName,username ) {
        try {
            const response = await axios.post(API_URL + 'register', {
                email: email,
                username: username,
                password: password,
                confirmpassword: confirmPassword,
                firstName: firstName,
                lastName: lastName
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        try {
            await axios.post(API_URL + 'logout');
          
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    setupAxiosInterceptors() {
        axios.interceptors.request.use(
            config => {
                const token = this.getToken();
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
}
export default new AuthService();