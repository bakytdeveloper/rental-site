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

// Прокрутка вверх при монтировании компонента и изменении фильтров
    useEffect(() => {
        scrollToTop();
    }, [location.search]);


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
            <Container>
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col lg={6} md={6} sm={8}>
                        <Card className="login-card">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <div className="login-logo">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="login-title">Панель авторизации</h3>
                                    {/*<p className="login-subtitle">Войдите для управления вашими сайтами</p>*/}
                                </div>

                                {error && (
                                    <Alert variant="danger" className="mb-3">
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
                                            placeholder="Введите email"
                                            disabled={loading}
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
                                            placeholder="Введите пароль"
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
                                                Вход...
                                            </>
                                        ) : (
                                            'Войти'
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminLogin;