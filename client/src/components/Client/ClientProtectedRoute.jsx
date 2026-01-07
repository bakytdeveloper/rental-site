// ClientProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import {clientAPI} from "../../services/api";

const ClientProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('clientToken');

        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            // Проверяем профиль клиента
            await clientAPI.getProfile();
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Client auth check failed:', error);
            localStorage.removeItem('clientToken');
            localStorage.removeItem('clientData');
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
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ClientProtectedRoute;