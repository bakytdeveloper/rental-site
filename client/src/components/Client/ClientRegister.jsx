import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { clientAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './ClientAuth.css';

const ClientRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно содержать не менее 3 символов';
        }

        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email адрес';
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать не менее 6 символов';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        if (formData.phone && !/^[+]?([1-9][\d\s\-().]{7,})$/.test(formData.phone)) {
            newErrors.phone = 'Введите корректный номер телефона';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...submitData } = formData;

            const response = await clientAPI.register(submitData);

            if (response.data.success) {
                // Save token and user data
                localStorage.setItem('clientToken', response.data.token);
                localStorage.setItem('clientData', JSON.stringify(response.data.user));

                toast.success('🎉 Регистрация успешна! Добро пожаловать в RentalSite');

                // Redirect to dashboard
                navigate('/client/dashboard');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
            toast.error(errorMessage);

            // Handle specific errors
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="client-auth-page">
            <Container className="container-custom py-5">
                <Row className="justify-content-center">
                    <Col lg={8} md={8} sm={12}>
                        <Card className="client-auth-card card-custom">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="auth-logo text-gradient mb-3">
                                        <span className="brand-accent">Rental</span>Site
                                    </div>
                                    <h3 className="auth-title section-title mb-2">Регистрация клиента</h3>
                                    <p className="auth-subtitle text-muted">
                                        Создайте аккаунт для управления вашими арендованными сайтами
                                    </p>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Имя пользователя *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Придумайте имя пользователя"
                                                    disabled={loading}
                                                    isInvalid={!!errors.username}
                                                    className="form-control-custom"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.username}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email адрес *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Введите ваш email"
                                                    disabled={loading}
                                                    isInvalid={!!errors.email}
                                                    className="form-control-custom"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Имя</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="Ваше имя"
                                                    disabled={loading}
                                                    className="form-control-custom"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Фамилия</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="Ваша фамилия"
                                                    disabled={loading}
                                                    className="form-control-custom"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Номер телефона</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+7 (999) 123-45-67"
                                            disabled={loading}
                                            isInvalid={!!errors.phone}
                                            className="form-control-custom"
                                        />
                                        <Form.Text className="text-muted">
                                            Рекомендуется указать для связи
                                        </Form.Text>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Пароль *</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Придумайте пароль"
                                                        disabled={loading}
                                                        isInvalid={!!errors.password}
                                                        className="form-control-custom"
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={togglePasswordVisibility}
                                                        disabled={loading}
                                                        className="password-toggle-btn"
                                                    >
                                                        {showPassword ? '🙈' : '👁️'}
                                                    </Button>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </InputGroup>
                                                <Form.Text className="text-muted small">
                                                    Нажмите на глаз, чтобы показать/скрыть пароль
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Подтверждение пароля *</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Повторите пароль"
                                                        disabled={loading}
                                                        isInvalid={!!errors.confirmPassword}
                                                        className="form-control-custom"
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={toggleConfirmPasswordVisibility}
                                                        disabled={loading}
                                                        className="password-toggle-btn"
                                                    >
                                                        {showConfirmPassword ? '🙈' : '👁️'}
                                                    </Button>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.confirmPassword}
                                                    </Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="info" className="mb-4">
                                        <small>
                                            ✅ После регистрации все ваши арендованные сайты автоматически появятся в личном кабинете
                                        </small>
                                    </Alert>

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
                                                Регистрация...
                                            </>
                                        ) : (
                                            'Зарегистрироваться'
                                        )}
                                    </Button>
                                </Form>

                                <div className="auth-footer mt-4 pt-3 border-top">
                                    <p className="text-center text-muted small mb-0">
                                        Уже есть аккаунт?{' '}
                                        <Link to="/client/login" className="text-primary">
                                            Войдите здесь
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

export default ClientRegister;