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
    const [passwordStrength, setPasswordStrength] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

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

            setRentalForm(prev => ({
                ...prev,
                name: user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username || '',
                email: user.email || '',
                phone: user.profile?.phone || '',
                message: `Я заинтересован в аренде сайта "${site?.title || 'этого сайта'}" и хотел бы узнать больше о процессе аренды.`
            }));

            setRegisterForm(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                phone: user.profile?.phone || ''
            }));
        } else {
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

        // Проверка сложности пароля
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    // Проверка сложности пароля
    const checkPasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength('');
            return;
        }

        let strength = 0;
        let tips = [];

        // Проверка длины
        if (password.length >= 8) strength++;
        else tips.push('Минимум 8 символов');

        // Проверка на цифры
        if (/\d/.test(password)) strength++;
        else tips.push('Добавьте хотя бы одну цифру');

        // Проверка на буквы в разных регистрах
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        else tips.push('Добавьте буквы в верхнем и нижнем регистре');

        // Проверка на специальные символы
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        else tips.push('Добавьте специальный символ (!@#$%^&*)');

        // Определяем уровень сложности
        let strengthText = '';
        let strengthColor = '';

        switch(strength) {
            case 4:
                strengthText = 'Отличный пароль! ✅';
                strengthColor = 'text-success';
                break;
            case 3:
                strengthText = 'Хороший пароль 👍';
                strengthColor = 'text-warning';
                break;
            case 2:
                strengthText = 'Слабый пароль ⚠️';
                strengthColor = 'text-warning';
                break;
            case 1:
                strengthText = 'Очень слабый пароль ❌';
                strengthColor = 'text-danger';
                break;
            default:
                strengthText = '';
                strengthColor = '';
        }

        setPasswordStrength({
            text: strengthText,
            color: strengthColor,
            tips: tips
        });
    };

    // Валидация формы регистрации
    const validateRegisterForm = () => {
        const {
            username,
            email,
            password,
            confirmPassword,
            agreeTerms
        } = registerForm;

        const errors = [];

        if (!username) {
            errors.push('Пожалуйста, введите имя пользователя');
        } else if (username.length < 3) {
            errors.push('Имя пользователя должно содержать минимум 3 символа');
        }

        if (!email) {
            errors.push('Пожалуйста, введите email');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('Пожалуйста, введите корректный email');
            }
        }

        if (!password) {
            errors.push('Пожалуйста, введите пароль');
        } else if (password.length < 6) {
            errors.push('Пароль должен содержать минимум 6 символов');
        }

        if (!confirmPassword) {
            errors.push('Пожалуйста, подтвердите пароль');
        } else if (password !== confirmPassword) {
            errors.push('Пароли не совпадают');
        }

        if (!agreeTerms) {
            errors.push('Пожалуйста, согласитесь с условиями использования');
        }

        return errors.length > 0 ? errors.join('. ') : null;
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
        setFormSubmitted(true);
        setError('');

        const validationError = validateRegisterForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            const registerData = {
                username: registerForm.username.trim(),
                email: registerForm.email.trim(),
                password: registerForm.password.trim(),
                firstName: registerForm.username.trim(),
                lastName: '',
                phone: registerForm.phone.trim() || ''
            };

            console.log('📝 Регистрация пользователя:', { ...registerData, password: '***' });

            const registerResponse = await clientAPI.register(registerData);

            if (registerResponse.data.success) {
                localStorage.setItem('clientToken', registerResponse.data.token);
                localStorage.setItem('clientData', JSON.stringify(registerResponse.data.user));

                toast.success('✅ Регистрация прошла успешно!');

                const rentalData = {
                    siteId: site._id,
                    name: registerForm.username.trim(),
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

            if (error.response?.status === 400 && error.response?.data?.message?.includes('уже существует')) {
                errorMessage = 'Пользователь с таким email или именем уже существует. Пожалуйста, войдите в систему.';
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = () => {
        onHide();
        localStorage.setItem('rentalPendingData', JSON.stringify({
            siteId: site._id,
            siteTitle: site.title,
            formData: rentalForm
        }));
        window.location.href = '/auth/login';
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                    // ФОРМА ДЛЯ НЕАВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
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
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Имя пользователя *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={registerForm.username}
                                            onChange={handleRegisterInputChange}
                                            required
                                            placeholder="Введите ваше имя"
                                            disabled={loading}
                                            isInvalid={formSubmitted && !registerForm.username}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Пожалуйста, введите имя пользователя
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Будет использоваться для входа и отображаться как ваше имя
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
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
                                            isInvalid={formSubmitted && !registerForm.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Пожалуйста, введите email
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
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
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Пароль *</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={registerForm.password}
                                                onChange={handleRegisterInputChange}
                                                required
                                                placeholder="Минимум 6 символов"
                                                disabled={loading}
                                                isInvalid={formSubmitted && !registerForm.password}
                                                className="border-end-0"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary border-start-0"
                                                onClick={togglePasswordVisibility}
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #dee2e6',
                                                    borderLeft: 'none'
                                                }}
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        <Form.Control.Feedback type="invalid">
                                            Пожалуйста, введите пароль
                                        </Form.Control.Feedback>

                                        {passwordStrength.text && (
                                            <div className={`mt-1 small ${passwordStrength.color}`}>
                                                <strong>{passwordStrength.text}</strong>
                                                {passwordStrength.tips && passwordStrength.tips.length > 0 && (
                                                    <div className="text-muted mt-1">
                                                        <small>Для улучшения пароля: {passwordStrength.tips.join(', ')}</small>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Подтвердите пароль *</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={registerForm.confirmPassword}
                                                onChange={handleRegisterInputChange}
                                                required
                                                placeholder="Повторите пароль"
                                                disabled={loading}
                                                isInvalid={formSubmitted && !registerForm.confirmPassword ||
                                                (registerForm.password && registerForm.confirmPassword &&
                                                    registerForm.password !== registerForm.confirmPassword)}
                                                className="border-end-0"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary border-start-0"
                                                onClick={toggleConfirmPasswordVisibility}
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #dee2e6',
                                                    borderLeft: 'none'
                                                }}
                                            >
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        <Form.Control.Feedback type="invalid">
                                            {!registerForm.confirmPassword ? 'Пожалуйста, подтвердите пароль' : 'Пароли не совпадают'}
                                        </Form.Control.Feedback>

                                        {registerForm.password && registerForm.confirmPassword &&
                                        registerForm.password === registerForm.confirmPassword && (
                                            <div className="text-success small mt-1">
                                                <strong>✓ Пароли совпадают</strong>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Улучшенный чекбокс */}
                            <Form.Group className="mb-4">
                                <div className={`border rounded p-3 ${formSubmitted && !registerForm.agreeTerms ? 'border-danger bg-danger-light' : 'border-light'}`}>
                                    <Form.Check
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        label={
                                            <div>
                                                <span className="fw-bold">Я соглашаюсь с условиями использования</span>
                                                <div className="mt-1">
                                                    <small className="text-muted">
                                                        Прочитайте{' '}
                                                        <a href="/terms" target="_blank" rel="noopener noreferrer"
                                                           className="text-primary">
                                                            условия использования
                                                        </a>{' '}
                                                        и{' '}
                                                        <a href="/privacy" target="_blank" rel="noopener noreferrer"
                                                           className="text-primary">
                                                            политику конфиденциальности
                                                        </a>
                                                        {' '}перед продолжением
                                                    </small>
                                                </div>
                                            </div>
                                        }
                                        checked={registerForm.agreeTerms}
                                        onChange={handleRegisterInputChange}
                                        disabled={loading}
                                        className="mb-0"
                                    />
                                </div>

                                {formSubmitted && !registerForm.agreeTerms && (
                                    <div className="text-danger small mt-2">
                                        <strong>⚠️ Пожалуйста, согласитесь с условиями использования</strong>
                                    </div>
                                )}
                            </Form.Group>

                            {/* Кнопка регистрации с предупреждением */}
                            <div className="d-grid gap-2">
                                <Button
                                    type="submit"
                                    variant={formSubmitted && !registerForm.agreeTerms ? "warning" : "success"}
                                    size="lg"
                                    disabled={loading}
                                    className={formSubmitted && !registerForm.agreeTerms ? "animate__animated animate__shakeX" : ""}
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
                                        <>
                                            🚀 Зарегистрироваться и отправить заявку
                                            {!registerForm.agreeTerms && (
                                                <span className="ms-2">(требуется согласие)</span>
                                            )}
                                        </>
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

                            {error && (
                                <Alert variant="danger" className="mb-3 mt-3">
                                    <strong>Ошибка:</strong> {error}
                                </Alert>
                            )}

                            {/* Подсказки по паролю */}
                            {registerForm.password && (
                                <div className="mt-3 p-3 border rounded bg-light">
                                    <h6 className="mb-2">📝 Советы по созданию надежного пароля:</h6>
                                    <ul className="mb-0 small">
                                        <li>Используйте не менее 8 символов</li>
                                        <li>Добавьте заглавные и строчные буквы</li>
                                        <li>Включите цифры (1, 2, 3...)</li>
                                        <li>Добавьте специальные символы (!@#$%^&*)</li>
                                        <li>Избегайте простых комбинаций (123456, password)</li>
                                    </ul>
                                </div>
                            )}
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