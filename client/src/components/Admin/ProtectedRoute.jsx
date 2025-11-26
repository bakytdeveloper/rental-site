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
            // Verify token is still valid
            await authAPI.getMe();
            setIsAuthenticated(true);
        } catch (error) {
            // Token is invalid
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
        // Redirect to login page with return url
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;