import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { clientAPI, rentalAPI } from '../services/api'; // Добавил rentalAPI
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import './ClientDashboard.css';

const ClientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [rentals, setRentals] = useState([]);
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
            navigate('/auth/login');
        }
    };

    const fetchDashboardData = async () => {
        startLoading();
        try {
            // Загружаем данные параллельно
            const [profileRes, notificationsRes, rentalsRes] = await Promise.all([
                clientAPI.getProfile(),
                clientAPI.getNotifications(),
                rentalAPI.getMyRentals()
            ]);

            setUserData(profileRes.data.user);
            setNotifications(notificationsRes.data.notifications || []);
            setUnreadCount(notificationsRes.data.unreadCount || 0);
            setRentals(rentalsRes.data.rentals || []);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('clientToken');
                localStorage.removeItem('clientData');
                navigate('/auth/login');
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
        const statusText = {
            'pending': 'В ожидании',
            'active': 'Активна',
            'payment_due': 'Ожидает оплаты',
            'cancelled': 'Отменена'
        };

        if (status === 'cancelled') {
            return <Badge bg="secondary">{statusText[status]}</Badge>;
        }

        if (status === 'payment_due') {
            return <Badge bg="danger">{statusText[status]}</Badge>;
        }

        if (status === 'pending') {
            return <Badge bg="warning">{statusText[status]}</Badge>;
        }

        // Для активной аренды
        if (daysRemaining <= 0) {
            return <Badge bg="danger">Истекла</Badge>;
        }
        if (daysRemaining <= 3) {
            return <Badge bg="warning">Заканчивается ({daysRemaining} дн.)</Badge>;
        }
        return <Badge bg="success">Активна ({daysRemaining} дн.)</Badge>;
    };

    const handleLogout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        navigate('/');
        toast.success('Вы успешно вышли из системы');
    };

    // Расчет статистики из аренд
    const stats = {
        totalRentals: rentals.length,
        activeRentals: rentals.filter(r => r.status === 'active').length,
        pendingRentals: rentals.filter(r => r.status === 'pending').length,
        paymentDueRentals: rentals.filter(r => r.status === 'payment_due').length,
        totalSpent: rentals.reduce((sum, rental) => sum + (rental.totalPaid || 0), 0)
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
                    <Button onClick={() => navigate('/auth/login')} variant="primary">
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
                                                {stats.totalRentals}
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
                                                {stats.activeRentals}
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
                                                {stats.pendingRentals}
                                            </div>
                                            <div className="stats-label text-muted">В ожидании</div>
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
                                            {rentals.length > 0 ? (
                                                <div className="rentals-grid">
                                                    {rentals.map((rental) => {
                                                        const daysRemaining = getDaysRemaining(rental.rentalEndDate);
                                                        return (
                                                            <div key={rental._id} className="rental-card card-custom p-3 mb-3">
                                                                <Row className="align-items-center">
                                                                    <Col md={3} className="mb-3 mb-md-0">
                                                                        {rental.siteId?.images?.[0] ? (
                                                                            <img
                                                                                src={`http://localhost:5000${rental.siteId.images[0]}`}
                                                                                alt={rental.siteId.title}
                                                                                className="rental-site-image"
                                                                            />
                                                                        ) : (
                                                                            <div className="no-image-placeholder d-flex align-items-center justify-content-center">
                                                                                <span className="display-6">🌐</span>
                                                                            </div>
                                                                        )}
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <h5 className="mb-2">{rental.siteId?.title || 'Сайт'}</h5>
                                                                        <div className="rental-details text-muted mb-2">
                                                                            <div>Категория: {rental.siteId?.category || 'Не указана'}</div>
                                                                            <div>Цена: ₸{rental.monthlyPrice || 0}/месяц</div>
                                                                            <div>Статус: {getRentalStatusBadge(rental.status, daysRemaining)}</div>
                                                                            <div>Дата начала: {rental.rentalStartDate ? new Date(rental.rentalStartDate).toLocaleDateString() : 'Не указана'}</div>
                                                                            <div>Дата окончания: {rental.rentalEndDate ? new Date(rental.rentalEndDate).toLocaleDateString() : 'Не указана'}</div>
                                                                            <div>Всего оплачено: ₸{rental.totalPaid || 0}</div>
                                                                        </div>
                                                                    </Col>
                                                                    <Col md={3} className="text-md-end">
                                                                        <Button
                                                                            as={Link}
                                                                            to={`/rentals/${rental._id}`}
                                                                            variant="outline-light"
                                                                            size="sm"
                                                                            className="w-100 w-md-auto"
                                                                        >
                                                                            Детали аренды
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
                                                        <h6 className="section-title mb-3">Статистика аренды</h6>
                                                        <div className="profile-info">
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Всего аренд:</span>
                                                                <span className="info-value">{stats.totalRentals}</span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Активные аренды:</span>
                                                                <span className="info-value text-success">{stats.activeRentals}</span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">В ожидании:</span>
                                                                <span className="info-value text-warning">{stats.pendingRentals}</span>
                                                            </div>
                                                            <div className="info-item mb-2">
                                                                <span className="info-label text-muted">Ожидают оплаты:</span>
                                                                <span className="info-value text-danger">{stats.paymentDueRentals}</span>
                                                            </div>
                                                            <div className="info-item">
                                                                <span className="info-label text-muted">Всего оплачено:</span>
                                                                <span className="info-value text-primary">₸{stats.totalSpent}</span>
                                                            </div>
                                                        </div>
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
                                                                    {notification.rentalId && (
                                                                        <div className="notification-link mt-2">
                                                                            <Button
                                                                                as={Link}
                                                                                to={`/rentals/${notification.rentalId}`}
                                                                                size="sm"
                                                                                variant="link"
                                                                                className="p-0"
                                                                            >
                                                                                Перейти к аренде →
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Badge bg={
                                                                    notification.type === 'rental_expiring' ? 'warning' :
                                                                        notification.type === 'rental_expired' ? 'danger' :
                                                                            notification.type === 'payment' ? 'success' : 'info'
                                                                }>
                                                                    {notification.type === 'rental_expiring' ? 'Важно' :
                                                                        notification.type === 'rental_expired' ? 'Истекло' :
                                                                            notification.type === 'payment' ? 'Платеж' : 'Система'}
                                                                </Badge>
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
                                                            defaultChecked={userData.settings?.emailNotifications?.rentalReminders ?? true}
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
                                                            defaultChecked={userData.settings?.emailNotifications?.paymentConfirmations ?? true}
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
                                                            defaultChecked={userData.settings?.emailNotifications?.systemUpdates ?? true}
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