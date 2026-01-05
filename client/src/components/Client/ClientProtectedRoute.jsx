import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { clientAPI } from '../../services/api';

const ClientProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('clientToken');

        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            // Verify token is still valid
            await clientAPI.getProfile();
            setIsAuthenticated(true);
        } catch (error) {
            // Token is invalid
            localStorage.removeItem('clientToken');
            localStorage.removeItem('clientData');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/client/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ClientProtectedRoute;