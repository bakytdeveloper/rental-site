import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { rentalAPI, clientAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './RequestRental.css';

const RequestRental = ({
                           site,
                           show,
                           onHide,
                           onSuccess
                       }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Форма для заявки (для авторизованных)
    const [rentalForm, setRentalForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    // Форма для регистрации + заявки (для неавторизованных)
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        agreeTerms: false
    });

    // Инициализация
    useEffect(() => {
        const clientData = localStorage.getItem('clientData');
        if (clientData) {
            const user = JSON.parse(clientData);
            setIsLoggedIn(true);
            setUserId(user.id);

            // Предзаполняем форму заявки данными пользователя
            setRentalForm(prev => ({
                ...prev,
                name: user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username || '',
                email: user.email || '',
                phone: user.profile?.phone || '',
                message: `Я заинтересован в аренде сайта "${site?.title || 'этого сайта'}" и хотел бы узнать больше о процессе аренды.`
            }));

            // Предзаполняем форму регистрации данными пользователя
            setRegisterForm(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                phone: user.profile?.phone || ''
            }));
        } else {
            // Для неавторизованных предзаполняем только сообщение
            setRentalForm(prev => ({
                ...prev,
                message: `Я заинтересован в аренде сайта "${site?.title || 'этого сайта'}" и хотел бы узнать больше о процессе аренды.`
            }));
        }
    }, [site, show]);

    // Обработчики форм
    const handleRentalInputChange = (e) => {
        const { name, value } = e.target;
        setRentalForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleRegisterInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    // Валидация формы регистрации
    const validateRegisterForm = () => {
        const {
            username,
            email,
            password,
            confirmPassword,
            firstName,
            agreeTerms
        } = registerForm;

        if (!username || !email || !password || !confirmPassword || !firstName) {
            return 'Пожалуйста, заполните все обязательные поля';
        }

        if (password !== confirmPassword) {
            return 'Пароли не совпадают';
        }

        if (password.length < 6) {
            return 'Пароль должен содержать минимум 6 символов';
        }

        if (!agreeTerms) {
            return 'Пожалуйста, согласитесь с условиями использования';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Пожалуйста, введите корректный email';
        }

        return null;
    };

    // Валидация формы заявки
    const validateRentalForm = () => {
        const { name, email, message } = rentalForm;

        if (!name || !email || !message) {
            return 'Пожалуйста, заполните все обязательные поля';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Пожалуйста, введите корректный email';
        }

        return null;
    };

    // Отправка заявки (для авторизованных)
    const handleRentalSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateRentalForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            const rentalData = {
                siteId: site._id,
                name: rentalForm.name.trim(),
                email: rentalForm.email.trim(),
                phone: rentalForm.phone.trim() || '',
                message: rentalForm.message.trim(),
                ...(userId && { userId })
            };

            console.log('📤 Отправка заявки на аренду:', rentalData);

            const response = await rentalAPI.requestRental(rentalData);

            if (response.data.success) {
                toast.success('🎉 Ваша заявка на аренду отправлена! Мы свяжемся с вами в течение 24 часов.');

                if (onSuccess) {
                    onSuccess(response.data.rental);
                }

                onHide();

                // Сбрасываем форму
                setRentalForm({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('❌ Ошибка при отправке заявки:', error);

            let errorMessage = 'Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                errorMessage = error.response.data.errors.join(', ');
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Объединенная регистрация + заявка
    const handleRegisterAndRequestSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateRegisterForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            // 1. Регистрируем пользователя
            const registerData = {
                username: registerForm.username.trim(),
                email: registerForm.email.trim(),
                password: registerForm.password.trim(),
                firstName: registerForm.firstName.trim(),
                lastName: registerForm.lastName.trim() || '',
                phone: registerForm.phone.trim() || ''
            };

            console.log('📝 Регистрация пользователя:', { ...registerData, password: '***' });

            const registerResponse = await clientAPI.register(registerData);

            if (registerResponse.data.success) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('clientToken', registerResponse.data.token);
                localStorage.setItem('clientData', JSON.stringify(registerResponse.data.user));

                toast.success('✅ Регистрация прошла успешно!');

                // 2. Отправляем заявку на аренду
                const rentalData = {
                    siteId: site._id,
                    name: `${registerForm.firstName} ${registerForm.lastName || ''}`.trim(),
                    email: registerForm.email.trim(),
                    phone: registerForm.phone.trim() || '',
                    message: `Я заинтересован в аренде сайта "${site?.title || 'этого сайта'}" и хотел бы узнать больше о процессе аренды.`,
                    userId: registerResponse.data.user.id
                };

                console.log('📤 Отправка заявки после регистрации:', rentalData);

                const rentalResponse = await rentalAPI.requestRental(rentalData);

                if (rentalResponse.data.success) {
                    toast.success('🎉 Заявка на аренду отправлена! Теперь у вас есть личный кабинет.');

                    if (onSuccess) {
                        onSuccess(rentalResponse.data.rental);
                    }

                    onHide();

                    // Перенаправляем в личный кабинет
                    setTimeout(() => {
                        window.location.href = '/client/dashboard';
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка при регистрации и заявке:', error);

            let errorMessage = 'Не удалось выполнить операцию. Пожалуйста, попробуйте еще раз.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                errorMessage = error.response.data.errors.join(', ');
            }

            // Проверяем, если пользователь уже существует
            if (error.response?.status === 400 && error.response?.data?.message?.includes('уже существует')) {
                errorMessage = 'Пользователь с таким email или именем уже существует. Пожалуйста, войдите в систему.';
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Быстрый вход для тех, кто уже зарегистрирован
    const handleQuickLogin = () => {
        onHide();
        // Сохраняем данные формы для быстрого входа
        localStorage.setItem('rentalPendingData', JSON.stringify({
            siteId: site._id,
            siteTitle: site.title,
            formData: rentalForm
        }));
        window.location.href = '/auth/login';
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
            className="rental-request-modal"
        >
            <Modal.Header closeButton className="border-bottom">
                <div>
                    <Modal.Title className="text-primary">
                        {isLoggedIn ? 'Заявка на аренду' : 'Регистрация и заявка на аренду'}
                    </Modal.Title>
                    <div className="modal-subtitle text-muted">
                        <strong>{site?.title}</strong> • ₸{site?.price || 0}/месяц
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body>
                {isLoggedIn ? (
                    // ФОРМА ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
                    <div>
                        <Alert variant="success" className="mb-4">
                            <div className="d-flex align-items-center">
                                <div className="me-2">👋</div>
                                <div>
                                    <strong>Добро пожаловать!</strong>
                                    <p className="mb-0 mt-1">
                                        Ваша заявка будет привязана к вашему аккаунту.
                                        Вы сможете отслеживать её статус в личном кабинете.
                                    </p>
                                </div>
                            </div>
                        </Alert>

                        <Form onSubmit={handleRentalSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Имя *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={rentalForm.name}
                                            onChange={handleRentalInputChange}
                                            required
                                            disabled={loading}
                                            placeholder="Ваше имя"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={rentalForm.email}
                                            onChange={handleRentalInputChange}
                                            required
                                            disabled={loading}
                                            placeholder="Ваш email"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={rentalForm.phone}
                                    onChange={handleRentalInputChange}
                                    placeholder="+7 (999) 123-45-67"
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Сообщение *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="message"
                                    value={rentalForm.message}
                                    onChange={handleRentalInputChange}
                                    required
                                    placeholder="Расскажите о ваших потребностях..."
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    Опишите, как вы планируете использовать сайт
                                </Form.Text>
                            </Form.Group>

                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            <div className="d-grid">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Отправка...
                                        </>
                                    ) : (
                                        '📧 Отправить заявку на аренду'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                ) : (
                    // ФОРМА ДЛЯ НЕАВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ (РЕГИСТРАЦИЯ + ЗАЯВКА)
                    <div>
                        <Alert variant="info" className="mb-4">
                            <div className="d-flex align-items-start">
                                <div className="me-2">💡</div>
                                <div>
                                    <strong>Для отправки заявки нужно зарегистрироваться</strong>
                                    <p className="mb-0 mt-1">
                                        После регистрации вы сможете отслеживать статус заявки,
                                        управлять арендой и получать уведомления в личном кабинете.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="p-0 mt-2"
                                        onClick={handleQuickLogin}
                                        disabled={loading}
                                    >
                                        Уже есть аккаунт? Войти
                                    </Button>
                                </div>
                            </div>
                        </Alert>

                        <Form onSubmit={handleRegisterAndRequestSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Имя *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={registerForm.firstName}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="Иван"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Фамилия</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={registerForm.lastName}
                                            onChange={handleRegisterInputChange}
                                            placeholder="Петров"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Имя пользователя *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={registerForm.username}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="ivan_petrov"
                                            disabled={loading}
                                        />
                                        <Form.Text className="text-muted">
                                            Будет использоваться для входа
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="ivan@example.com"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Пароль *</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={registerForm.password}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="Минимум 6 символов"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Подтвердите пароль *</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            value={registerForm.confirmPassword}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="Повторите пароль"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={registerForm.phone}
                                    onChange={handleRegisterInputChange}
                                    placeholder="+7 (999) 123-45-67"
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Check
                                    type="checkbox"
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    label={
                                        <span>
                                            Я соглашаюсь с{' '}
                                            <a href="/terms" target="_blank" rel="noopener noreferrer">
                                                условиями использования
                                            </a>{' '}
                                            и{' '}
                                            <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                                политикой конфиденциальности
                                            </a>
                                        </span>
                                    }
                                    checked={registerForm.agreeTerms}
                                    onChange={handleRegisterInputChange}
                                    disabled={loading}
                                />
                            </Form.Group>

                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            <div className="d-grid gap-2">
                                <Button
                                    type="submit"
                                    variant="success"
                                    size="lg"
                                    disabled={loading || !registerForm.agreeTerms}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Регистрация...
                                        </>
                                    ) : (
                                        '🚀 Зарегистрироваться и отправить заявку'
                                    )}
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    onClick={handleQuickLogin}
                                    disabled={loading}
                                >
                                    Уже есть аккаунт? Войти
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="border-top pt-3">
                <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            <strong>Сайт:</strong> {site?.title}
                        </div>
                        <div className="text-primary fw-bold">
                            ₸{site?.price || 0}/месяц
                        </div>
                    </div>
                    <div className="text-center mt-2 small text-muted">
                        Обычный ответ в течение 24 часов
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default RequestRental;