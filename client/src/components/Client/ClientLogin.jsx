import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { clientAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './ClientAuth.css';

const ClientLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('clientToken');
        if (token) {
            navigate('/client/dashboard', { replace: true });
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
        setLoading(true);

        try {
            const response = await clientAPI.login(formData);

            if (response.data.success) {
                // Save token and user data
                localStorage.setItem('clientToken', response.data.token);
                localStorage.setItem('clientData', JSON.stringify(response.data.user));

                toast.success('👋 Добро пожаловать обратно!');

                // Redirect to dashboard or previous page
                const from = location.state?.from?.pathname || '/client/dashboard';
                navigate(from, { replace: true });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка входа';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="client-auth-page">
            <Container className="container-custom py-5">
                <Row className="justify-content-center">
                    <Col lg={5} md={6} sm={8}>
                        <Card className="client-auth-card card-custom">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="auth-logo text-gradient mb-3">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="auth-title section-title mb-2">Вход для клиентов</h3>
                                    <p className="auth-subtitle text-muted">
                                        Войдите в личный кабинет для управления арендой
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email адрес</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Введите ваш email"
                                            disabled={loading}
                                            className="form-control-custom"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Пароль</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Введите ваш пароль"
                                            disabled={loading}
                                            className="form-control-custom"
                                        />
                                        <div className="text-end mt-2">
                                            <Link to="/client/forgot-password" className="text-primary small">
                                                Забыли пароль?
                                            </Link>
                                        </div>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 auth-btn btn-primary-custom py-3"
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
                                                Вход...
                                            </>
                                        ) : (
                                            'Войти'
                                        )}
                                    </Button>
                                </Form>

                                <div className="auth-footer mt-4 pt-3 border-top">
                                    <p className="text-center text-muted small mb-0">
                                        Нет аккаунта?{' '}
                                        <Link to="/client/register" className="text-primary">
                                            Зарегистрируйтесь
                                        </Link>
                                    </p>
                                    <p className="text-center text-muted small mt-2">
                                        <Link to="/" className="text-muted">
                                            ← Вернуться на главную
                                        </Link>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ClientLogin;