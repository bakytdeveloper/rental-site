import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { authAPI } from '../../services/api';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            // Проверяем профиль админа
            await authAPI.getAdminProfile();
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            // Токен недействителен
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
        }
    };

    if (isAuthenticated === null) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!isAuthenticated) {
        // Перенаправляем на универсальную страницу авторизации
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;