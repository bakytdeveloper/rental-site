import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ToggleButton, ToggleButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, clientAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminLogin.css';

const Auth = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'client'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Только базовая проверка и прокрутка
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

        // Если пользователь уже авторизован, редиректим
        const adminToken = localStorage.getItem('adminToken');
        const clientToken = localStorage.getItem('clientToken');

        // НЕ делаем навигацию здесь - это вызывает конфликты
        // Вместо этого просто показываем соответствующее сообщение
        if (adminToken && location.pathname === '/auth/login') {
            console.log('Админ уже авторизован, можно перенаправить вручную');
        }
        if (clientToken && location.pathname === '/auth/login') {
            console.log('Клиент уже авторизован, можно перенаправить вручную');
        }
    }, [location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleUserTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            userType: type
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        setError('');
        setLoading(true);

        try {
            let response;
            const isAdmin = formData.userType === 'admin';

            console.log('Попытка авторизации:', { isAdmin, email: formData.email });

            if (isAdmin) {
                response = await authAPI.loginAdmin({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                response = await clientAPI.login({
                    email: formData.email,
                    password: formData.password
                });
            }

            console.log('Ответ сервера:', response.data);

            if (response.data.success) {
                const tokenKey = isAdmin ? 'adminToken' : 'clientToken';
                const userKey = isAdmin ? 'adminUser' : 'clientData';
                const redirectPath = isAdmin ? '/admin' : '/client/dashboard';

                // Сохраняем данные
                localStorage.setItem(tokenKey, response.data.token);
                localStorage.setItem(userKey, JSON.stringify(response.data.user));

                console.log('Данные сохранены в localStorage:', {
                    tokenKey,
                    userKey,
                    token: response.data.token.substring(0, 20) + '...'
                });

                toast.success(isAdmin
                    ? 'Добро пожаловать, администратор!'
                    : 'Добро пожаловать обратно!', {
                    autoClose: 1000
                });

                // НЕ используем setTimeout - это может вызывать проблемы
                // Просто делаем навигацию
                console.log('Перенаправление на:', redirectPath);
                navigate(redirectPath, {
                    replace: true,
                    state: {
                        from: location,
                        userType: formData.userType
                    }
                });

                return;
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);

            let errorMessage = 'Произошла ошибка при авторизации';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            toast.error(errorMessage, { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRegisterClick = () => {
        navigate('/client/register');
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        navigate('/client/forgot-password');
    };

    const handleBackToHome = () => {
        navigate('/');
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
                                            disabled={loading}
                                        >
                                            👤 Клиент
                                        </ToggleButton>
                                        <ToggleButton
                                            id="admin-type"
                                            value="admin"
                                            variant={formData.userType === 'admin' ? 'primary' : 'outline-primary'}
                                            className="py-2"
                                            disabled={loading}
                                        >
                                            🛠 Администратор
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </div>

                                {error && (
                                    <Alert
                                        variant="danger"
                                        className="mb-4"
                                        onClose={() => setError('')}
                                        dismissible
                                    >
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
                                            autoComplete="username"
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
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={togglePasswordVisibility}
                                                disabled={loading}
                                                className="password-toggle-btn"
                                                type="button"
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </Button>
                                        </InputGroup>

                                        {formData.userType === 'client' && (
                                            <div className="text-end mt-2">
                                                <Button
                                                    variant="link"
                                                    className="text-primary small p-0"
                                                    onClick={handleForgotPassword}
                                                    disabled={loading}
                                                >
                                                    Забыли пароль?
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 login-btn btn-primary-custom py-3"
                                        disabled={loading || !formData.email.trim() || !formData.password.trim()}
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
                                                <Button
                                                    variant="link"
                                                    className="text-primary p-0"
                                                    onClick={handleRegisterClick}
                                                    disabled={loading}
                                                >
                                                    Зарегистрируйтесь
                                                </Button>
                                            </p>
                                            <p className="text-center text-muted small mb-0">
                                                <Button
                                                    variant="link"
                                                    className="text-muted p-0"
                                                    onClick={handleBackToHome}
                                                    disabled={loading}
                                                >
                                                    ← Вернуться на главную
                                                </Button>
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