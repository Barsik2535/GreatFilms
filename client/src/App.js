import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AuthService from './services/auth.service';
import Movies from './components/Movie';
import ForumPage from './components/ForumPage.tsx';
// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    if (!AuthService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    useEffect(() => {
        // Setup axios interceptors for auth token
        AuthService.setupAxiosInterceptors();
    }, []);

    return (
        <Router>
            <Routes> /
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/forum/:topicId" element={<ForumPage />} />
            </Routes>
        </Router>
    );
}

export default App;