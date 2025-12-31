import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminLogin.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Функция для прокрутки наверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

    // Прокрутка вверх при монтировании компонента
    useEffect(() => {
        scrollToTop();
    }, []);

    // Проверяем, не вошел ли пользователь уже
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
        setLoading(true);

        try {
            const response = await authAPI.login(formData);

            if (response.data.success) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));

                toast.success('С возвращением!');

                // Перенаправляем на нужную страницу или панель управления
                const from = location.state?.from?.pathname || '/admin';
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
        <div className="admin-login-page">
            <Container className="container-custom">
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col lg={5} md={6} sm={8}>
                        <Card className="login-card card-custom">
                            <Card.Body className="p-4 p-md-2">
                                <div className="text-center mb-4">
                                    <div className="login-logo text-gradient mb-3">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="login-title section-title mb-2">Панель авторизации</h3>
                                    <p className="login-subtitle text-muted">Войдите для управления контентом</p>
                                </div>

                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="mb-2">Email адрес</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Введите email"
                                            disabled={loading}
                                            className="login-form-control glass-effect"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="mb-2">Пароль</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Введите пароль"
                                            disabled={loading}
                                            className="login-form-control glass-effect"
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 login-btn btn-primary-custom py-3"
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

                                <div className="login-footer mt-4 pt-3 border-top">
                                    <p className="text-center text-muted small mb-0 login-footer-text-center">
                                        Используйте учетные данные администратора для доступа
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

export default AdminLogin;