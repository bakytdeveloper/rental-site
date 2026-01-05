import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import './ClientDashboard.css';

const ClientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('rentals');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { loading, startLoading, stopLoading } = useLoading();
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchDashboardData();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('clientToken');
        if (!token) {
            navigate('/client/login');
        }
    };

    const fetchDashboardData = async () => {
        startLoading();
        try {
            const [profileRes, notificationsRes] = await Promise.all([
                clientAPI.getProfile(),
                clientAPI.getNotifications()
            ]);

            setUserData(profileRes.data.user);
            setNotifications(notificationsRes.data.notifications || []);
            setUnreadCount(notificationsRes.data.unreadCount || 0);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('clientToken');
                localStorage.removeItem('clientData');
                navigate('/client/login');
            }
        } finally {
            stopLoading();
        }
    };

    const handleMarkNotificationsRead = async () => {
        try {
            await clientAPI.markNotificationsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            toast.success('Уведомления отмечены как прочитанные');
        } catch (error) {
            console.error('Ошибка при обновлении уведомлений:', error);
        }
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getRentalStatusBadge = (status, daysRemaining) => {
        if (status === 'expired') {
            return <Badge bg="danger">Истек</Badge>;
        }
        if (daysRemaining <= 0) {
            return <Badge bg="warning">Требуется оплата</Badge>;
        }
        if (daysRemaining <= 3) {
            return <Badge bg="warning">Скоро истекает ({daysRemaining} дн.)</Badge>;
        }
        return <Badge bg="success">Активен ({daysRemaining} дн.)</Badge>;
    };

    const handleLogout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        navigate('/');
        toast.success('Вы успешно вышли из системы');
    };

    if (loading && !userData) {
        return (
            <div className="client-dashboard-loading text-center py-5">
                <Container>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted">Загрузка личного кабинета...</p>
                </Container>
            </div>
        );
    }

    if (!userData) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>Ошибка загрузки данных</h4>
                    <p>Не удалось загрузить данные личного кабинета.</p>
                    <Button onClick={() => navigate('/client/login')} variant="primary">
                        Войти снова
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="client-dashboard-page">
            <Container className="container-custom py-5">
                {/* Dashboard Header */}
                <Row className="mb-5">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h1 className="dashboard-title section-title mb-2">
                                    Личный кабинет
                                </h1>
                                <p className="dashboard-subtitle text-muted mb-0">
                                    Добро пожаловать, {userData.profile?.firstName || userData.username}!
                                </p>
                            </div>
                            <Button
                                variant="outline-light"
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                🚪 Выйти
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <Row className="g-4 mb-5">
                            <Col md={3} sm={6}>
                                <Card className="stats-card card-custom">
                                    <Card.Body className="p-3">
                                        <div className="stats-content">
                                            <div className="stats-number text-primary">
                                                {userData.statistics?.totalRentals || 0}
                                            </div>
                                            <div className="stats-label text-muted">Всего аренд</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3} sm={6}>
                                <Card className="stats-card card-custom">
                                    <Card.Body className="p-3">
                                        <div className="stats-content">
                                            <div className="stats-number text-success">
                                                {userData.statistics?.activeRentals || 0}
                                            </div>
                                            <div className="stats-label text-muted">Активных</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3} sm={6}>
                                <Card className="stats-card card-custom">
                                    <Card.Body className="p-3">
                                        <div className="stats-content">
                                            <div className="stats-number text-warning">
                                                {userData.statistics?.expiredRentals || 0}
                                            </div>
                                            <div className="stats-label text-muted">Истекших</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3} sm={6}>
                                <Card className="stats-card card-custom">
                                    <Card.Body className="p-3">
                                        <div className="stats-content">
                                            <div className="stats-number text-info">
                                                {unreadCount}
                                            </div>
                                            <div className="stats-label text-muted">
                                                Непрочитанных уведомлений
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Main Content Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Row>
                        <Col lg={3}>
                            <Card className="sidebar-card card-custom mb-4 mb-lg-0">
                                <Card.Body className="p-3">
                                    <Nav variant="pills" className="flex-column">
                                        <Nav.Item>
                                            <Nav.Link eventKey="rentals" className="sidebar-nav-link">
                                                🏠 Мои аренды
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="profile" className="sidebar-nav-link">
                                                👤 Профиль
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="notifications" className="sidebar-nav-link">
                                                🔔 Уведомления
                                                {unreadCount > 0 && (
                                                    <Badge bg="danger" className="ms-2">
                                                        {unreadCount}
                                                    </Badge>
                                                )}
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="settings" className="sidebar-nav-link">
                                                ⚙️ Настройки
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={9}>
                            <Tab.Content>
                                {/* Rentals Tab */}
                                <Tab.Pane eventKey="rentals">
                                    <Card className="content-card card-custom">
                                        <Card.Header className="border-bottom p-4">
                                            <h4 className="mb-0">🏠 Мои арендованные сайты</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            {userData.rentedSites && userData.rentedSites.length > 0 ? (
                                                <div className="rentals-grid">
                                                    {userData.rentedSites.map((rental, index) => {
                                                        const daysRemaining = getDaysRemaining(rental.rentalEndDate);
                                                        return (
                                                            <div key={index} className="rental-card card-custom p-3 mb-3">
                                                                <Row className="align-items-center">
                                                                    <Col md={3} className="mb-3 mb-md-0">
                                                                        {rental.site?.images?.[0] ? (
                                                                            <img
                                                                                src={`http://localhost:5000${rental.site.images[0]}`}
                                                                                alt={rental.site.title}
                                                                                className="rental-site-image"
                                                                            />
                                                                        ) : (
                                                                            <div className="no-image-placeholder d-flex align-items-center justify-content-center">
                                                                                <span className="display-6">🌐</span>
                                                                            </div>
                                                                        )}
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <h5 className="mb-2">{rental.site?.title || 'Сайт'}</h5>
                                                                        <div className="rental-details text-muted mb-2">
                                                                            <div>Категория: {rental.site?.category || 'Не указана'}</div>
                                                                            <div>Цена: ₸{rental.monthlyPrice || 0}/месяц</div>
                                                                            <div>
                                                                                До: {new Date(rental.rentalEndDate).toLocaleDateString()}
                                                                            </div>
                                                                        </div>
                                                                        {getRentalStatusBadge(rental.status, daysRemaining)}
                                                                    </Col>
                                                                    <Col md={3} className="text-md-end">
                                                                        <Button
                                                                            as={Link}
                                                                            to={`/client/rental/${rental.contact?._id}`}
                                                                            variant="outline-light"
                                                                            size="sm"
                                                                            className="w-100 w-md-auto"
                                                                        >
                                                                            Детали
                                                                        </Button>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="no-rentals text-center py-5">
                                                    <div className="no-data-icon mb-3">🏠</div>
                                                    <h5 className="mb-3">У вас пока нет арендованных сайтов</h5>
                                                    <p className="text-muted mb-4">
                                                        Начните аренду сайтов в нашем каталоге
                                                    </p>
                                                    <Button
                                                        as={Link}
                                                        to="/catalog"
                                                        variant="primary"
                                                        className="btn-primary-custom"
                                                    >
                                                        Перейти в каталог
                                                    </Button>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>

                                {/* Profile Tab */}
                                <Tab.Pane eventKey="profile">
                                    <Card className="content-card card-custom">
                                        <Card.Header className="border-bottom p-4">
                                            <h4 className="mb-0">👤 Мой профиль</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <Row>
                                                <Col md={6} className="mb-4">
                                                    <div className="profile-section">
                                                        <h6 className="section-title mb-3">Личная информация</h6>
                                                        <div className="profile-info">
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Имя пользователя:</span>
                                                                <span className="info-value">{userData.username}</span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Email:</span>
                                                                <span className="info-value">{userData.email}</span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Имя:</span>
                                                                <span className="info-value">
                                                                    {userData.profile?.firstName || 'Не указано'}
                                                                </span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Фамилия:</span>
                                                                <span className="info-value">
                                                                    {userData.profile?.lastName || 'Не указано'}
                                                                </span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Телефон:</span>
                                                                <span className="info-value">
                                                                    {userData.profile?.phone || 'Не указан'}
                                                                </span>
                                                            </div>
                                                            {userData.profile?.company && (
                                                                <div className="info-item">
                                                                    <span className="info-label text-muted">Компания:</span>
                                                                    <span className="info-value">{userData.profile.company}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6} className="mb-4">
                                                    <div className="profile-section">
                                                        <h6 className="section-title mb-3">Контактная информация</h6>
                                                        {userData.profile?.address ? (
                                                            <div className="profile-info">
                                                                <div className="info-item mb-2">
                                                                    <span className="info-label text-muted">Адрес:</span>
                                                                    <span className="info-value">{userData.profile.address.street}</span>
                                                                </div>
                                                                <div className="info-item mb-2">
                                                                    <span className="info-label text-muted">Город:</span>
                                                                    <span className="info-value">{userData.profile.address.city}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-label text-muted">Страна:</span>
                                                                    <span className="info-value">{userData.profile.address.country}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted">Контактная информация не указана</p>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div className="profile-actions mt-4">
                                                <Button
                                                    variant="outline-light"
                                                    onClick={() => navigate('/client/profile/edit')}
                                                    className="me-2"
                                                >
                                                    Редактировать профиль
                                                </Button>
                                                <Button
                                                    variant="outline-light"
                                                    onClick={() => navigate('/client/password/change')}
                                                >
                                                    Сменить пароль
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>

                                {/* Notifications Tab */}
                                <Tab.Pane eventKey="notifications">
                                    <Card className="content-card card-custom">
                                        <Card.Header className="border-bottom p-4">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="mb-0">🔔 Мои уведомления</h4>
                                                {unreadCount > 0 && (
                                                    <Button
                                                        variant="outline-light"
                                                        size="sm"
                                                        onClick={handleMarkNotificationsRead}
                                                    >
                                                        Отметить все как прочитанные
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            {notifications.length > 0 ? (
                                                <div className="notifications-list">
                                                    {notifications.map((notification, index) => (
                                                        <div
                                                            key={index}
                                                            className={`notification-item p-3 mb-2 card-custom ${!notification.read ? 'notification-unread' : ''}`}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="notification-content">
                                                                    <div className="notification-message mb-1">
                                                                        {notification.message}
                                                                    </div>
                                                                    <div className="notification-time text-muted small">
                                                                        {new Date(notification.createdAt).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                {notification.type === 'rental_expiring' && (
                                                                    <Badge bg="warning">Важно</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-notifications text-center py-5">
                                                    <div className="no-data-icon mb-3">🔔</div>
                                                    <h5 className="mb-3">Нет уведомлений</h5>
                                                    <p className="text-muted">Здесь будут появляться важные уведомления</p>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>

                                {/* Settings Tab */}
                                <Tab.Pane eventKey="settings">
                                    <Card className="content-card card-custom">
                                        <Card.Header className="border-bottom p-4">
                                            <h4 className="mb-0">⚙️ Настройки уведомлений</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <div className="settings-section mb-4">
                                                <h6 className="mb-3">Настройки email уведомлений</h6>
                                                <div className="settings-item d-flex justify-content-between align-items-center p-3 card-custom mb-2">
                                                    <div>
                                                        <div className="setting-label">Напоминания об аренде</div>
                                                        <div className="setting-description text-muted small">
                                                            Уведомления об окончании срока аренды
                                                        </div>
                                                    </div>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            defaultChecked={userData.settings?.emailNotifications?.rentalReminders}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="settings-item d-flex justify-content-between align-items-center p-3 card-custom mb-2">
                                                    <div>
                                                        <div className="setting-label">Подтверждения оплаты</div>
                                                        <div className="setting-description text-muted small">
                                                            Уведомления о получении платежей
                                                        </div>
                                                    </div>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            defaultChecked={userData.settings?.emailNotifications?.paymentConfirmations}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="settings-item d-flex justify-content-between align-items-center p-3 card-custom">
                                                    <div>
                                                        <div className="setting-label">Системные обновления</div>
                                                        <div className="setting-description text-muted small">
                                                            Новости и обновления системы
                                                        </div>
                                                    </div>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            defaultChecked={userData.settings?.emailNotifications?.systemUpdates}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="settings-actions">
                                                <Button variant="outline-light" className="me-2">
                                                    Сохранить настройки
                                                </Button>
                                                <Button variant="outline-light">
                                                    Сбросить настройки
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        </div>
    );
};

export default ClientDashboard;