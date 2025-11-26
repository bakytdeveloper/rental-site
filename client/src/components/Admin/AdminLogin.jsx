import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminLogin.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { loading, startLoading, stopLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        startLoading();

        try {
            const response = await authAPI.login(formData);

            if (response.data.success) {
                // Save token and user data
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));

                toast.success('Welcome back!');

                // Redirect to intended page or admin dashboard
                const from = location.state?.from?.pathname || '/admin';
                navigate(from, { replace: true });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            toast.error(message);
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="admin-login-page">
            <Container>
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col lg={4} md={6} sm={8}>
                        <Card className="login-card">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <div className="login-logo">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="login-title">Admin Panel</h3>
                                    <p className="login-subtitle">Sign in to manage your websites</p>
                                </div>

                                {error && (
                                    <Alert variant="danger" className="mb-3">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your email"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your password"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-100 login-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </Form>

                                <div className="login-footer text-center mt-4">
                                    <small className="text-muted">
                                        Forgot your credentials? Contact system administrator.
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminLogin;