import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ToggleButton, ToggleButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, clientAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminLogin.css'; // Используем стили админ-логина

const Auth = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'client' // 'client' или 'admin'
    });

    const [showPassword, setShowPassword] = useState(false); // Состояние для отображения пароля
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Прокрутка вверх при монтировании
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, []);

    // Проверяем, не вошел ли пользователь уже
    useEffect(() => {
        const checkAuth = () => {
            const clientToken = localStorage.getItem('clientToken');
            const adminToken = localStorage.getItem('adminToken');

            if (clientToken) {
                navigate('/client/dashboard', { replace: true });
            } else if (adminToken) {
                navigate('/admin', { replace: true });
            }
        };

        checkAuth();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleUserTypeChange = (type) => {
        setFormData({
            ...formData,
            userType: type
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;

            if (formData.userType === 'admin') {
                response = await authAPI.login(formData);
            } else {
                response = await clientAPI.login(formData);
            }

            if (response.data.success) {
                const tokenKey = formData.userType === 'admin' ? 'adminToken' : 'clientToken';
                const userKey = formData.userType === 'admin' ? 'adminUser' : 'clientData';
                const redirectPath = formData.userType === 'admin' ? '/admin' : '/client/dashboard';

                // Сохраняем токен и данные пользователя
                localStorage.setItem(tokenKey, response.data.token);
                localStorage.setItem(userKey, JSON.stringify(response.data.user));

                toast.success(formData.userType === 'admin' ? 'С возвращением!' : '👋 Добро пожаловать обратно!');

                // Перенаправляем на нужную страницу
                const from = location.state?.from?.pathname || redirectPath;
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

    // Функция для переключения видимости пароля
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="admin-login-page">
            <Container className="container-custom">
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col lg={7} md={6} sm={8}>
                        <Card className="login-card card-custom">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="login-logo text-gradient mb-3">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="login-title section-title mb-2">Авторизация</h3>
                                    <p className="login-subtitle text-muted">
                                        Войдите для доступа к системе
                                    </p>
                                </div>

                                {/* Переключатель типа пользователя */}
                                <div className="mb-4 text-center">
                                    <ToggleButtonGroup
                                        type="radio"
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleUserTypeChange}
                                        className="w-100"
                                    >
                                        <ToggleButton
                                            id="client-type"
                                            value="client"
                                            variant={formData.userType === 'client' ? 'primary' : 'outline-primary'}
                                            className="py-2"
                                        >
                                            👤 Клиент
                                        </ToggleButton>
                                        <ToggleButton
                                            id="admin-type"
                                            value="admin"
                                            variant={formData.userType === 'admin' ? 'primary' : 'outline-primary'}
                                            className="py-2"
                                        >
                                            🛠 Администратор
                                        </ToggleButton>
                                    </ToggleButtonGroup>
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
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Введите пароль"
                                                disabled={loading}
                                                className="login-form-control glass-effect"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={togglePasswordVisibility}
                                                disabled={loading}
                                                className="password-toggle-btn"
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </Button>
                                        </InputGroup>

                                        {formData.userType === 'client' && (
                                            <div className="text-end mt-2">
                                                <a
                                                    href="/client/forgot-password"
                                                    className="text-primary small"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate('/client/forgot-password');
                                                    }}
                                                >
                                                    Забыли пароль?
                                                </a>
                                            </div>
                                        )}
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
                                    {formData.userType === 'client' ? (
                                        <>
                                            <p className="text-center text-muted small mb-2">
                                                Нет аккаунта?{' '}
                                                <a
                                                    href="/client/register"
                                                    className="text-primary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate('/client/register');
                                                    }}
                                                >
                                                    Зарегистрируйтесь
                                                </a>
                                            </p>
                                            <p className="text-center text-muted small mb-0">
                                                <a
                                                    href="/"
                                                    className="text-muted"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate('/');
                                                    }}
                                                >
                                                    ← Вернуться на главную
                                                </a>
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-center text-muted small mb-0 login-footer-text-center">
                                            Используйте учетные данные администратора для доступа
                                        </p>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Auth;