import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Dropdown } from 'react-bootstrap';
import { rentalAPI, siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminRentals.css';
import {useLocation} from "react-router-dom";

const AdminRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [selectedRental, setSelectedRental] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDatesModal, setShowDatesModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        dateRange: 'all'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        paymentDue: 0,
        expiringSoon: 0,
        totalRevenue: 0
    });
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'bank_transfer',
        periodMonths: '',
        notes: ''
    });
    const [datesData, setDatesData] = useState({
        rentalStartDate: '',
        rentalEndDate: ''
    });
    const { loading, startLoading, stopLoading } = useLoading();
    const location = useLocation();

    // Функция для прокрутки наверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToTop();
    }, [location.search]);

    useEffect(() => {
        fetchRentals();
        fetchRentalStats();
    }, [pagination.page, filters]);

    const fetchRentals = async () => {
        startLoading();
        try {
            const params = {
                page: pagination.page,
                limit: 20,
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            };

            const response = await rentalAPI.getAll(params);
            setRentals(response.data.rentals);
            setFilteredRentals(response.data.rentals);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination.totalPages,
                total: response.data.pagination.total
            }));
        } catch (error) {
            toast.error('Не удалось загрузить аренды');
            console.error('Ошибка загрузки аренд:', error);
        } finally {
            stopLoading();
        }
    };

    const fetchRentalStats = async () => {
        try {
            const response = await rentalAPI.getStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleViewDetails = (rental) => {
        setSelectedRental(rental);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedRental(null);
    };

    const updateRentalStatus = async (rentalId, newStatus) => {
        try {
            await rentalAPI.updateStatus(rentalId, { status: newStatus });
            toast.success(`Статус аренды обновлен на "${getStatusText(newStatus)}"`);
            fetchRentals();
            fetchRentalStats();
            if (selectedRental?._id === rentalId) {
                setSelectedRental(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Не удалось обновить статус аренды');
            console.error('Ошибка обновления статуса:', error);
        }
    };

    const handleAddPayment = async () => {
        if (!paymentData.amount || paymentData.amount <= 0) {
            toast.error('Введите корректную сумму');
            return;
        }

        try {
            await rentalAPI.addPayment(selectedRental._id, paymentData);
            toast.success('Платеж успешно добавлен');
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                paymentMethod: 'bank_transfer',
                periodMonths: '',
                notes: ''
            });
            fetchRentals();
            fetchRentalStats();
            // Закрываем модальное окно деталей, если оно открыто
            if (showDetailModal) {
                setShowDetailModal(false);
            }
        } catch (error) {
            toast.error('Не удалось добавить платеж');
            console.error('Ошибка платежа:', error);
        }
    };

    const handleUpdateDates = async () => {
        try {
            await rentalAPI.updateDates(selectedRental._id, datesData);
            toast.success('Даты аренды обновлены');
            setShowDatesModal(false);
            fetchRentals();
        } catch (error) {
            toast.error('Не удалось обновить даты');
            console.error('Ошибка обновления дат:', error);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'pending': 'warning',
            'active': 'success',
            'payment_due': 'danger',
            'cancelled': 'secondary'
        };
        const statusText = {
            'pending': 'В ожидании',
            'active': 'Активна',
            'payment_due': 'Ожидает оплаты',
            'cancelled': 'Отменена'
        };
        return (
            <Badge bg={variants[status] || 'secondary'} className="admin-rentals__status-badge">
                {statusText[status] || status}
            </Badge>
        );
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'В ожидании',
            'active': 'Активна',
            'payment_due': 'Ожидает оплаты',
            'cancelled': 'Отменена'
        };
        return statusMap[status] || status;
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date) => {
        if (!date) return 'Не указана';
        return new Date(date).toLocaleDateString('ru-RU');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading && rentals.length === 0) {
        return (
            <div className="admin-rentals__loading text-center py-5">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted">Загрузка аренд...</p>
            </div>
        );
    }

    return (
        <div className="admin-rentals container-custom py-4">
            <div className="admin-rentals__header mb-4">
                <h1 className="admin-rentals__title section-title mb-0">Управление арендами</h1>
                <div className="admin-rentals__stats">
                    <Badge bg="outline-info" className="admin-rentals__stat-badge">
                        Всего: {stats.total}
                    </Badge>
                    <Badge bg="outline-success" className="admin-rentals__stat-badge">
                        Активных: {stats.active}
                    </Badge>
                    <Badge bg="outline-warning" className="admin-rentals__stat-badge">
                        Ожидающих: {stats.pending}
                    </Badge>
                    <Badge bg="outline-danger" className="admin-rentals__stat-badge">
                        Просроченных: {stats.paymentDue}
                    </Badge>
                </div>
            </div>

            {/* Карточки статистики */}
            <Row className="admin-rentals__stats-row g-4 mb-4">
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-primary">{stats.total}</div>
                                <div className="admin-rentals__stat-label text-muted">Всего аренд</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-success">{stats.active}</div>
                                <div className="admin-rentals__stat-label text-muted">Активных</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-warning">{stats.pending}</div>
                                <div className="admin-rentals__stat-label text-muted">В ожидании</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-danger">{stats.paymentDue}</div>
                                <div className="admin-rentals__stat-label text-muted">Просрочено</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-info">{stats.expiringSoon}</div>
                                <div className="admin-rentals__stat-label text-muted">Истекает скоро</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                    <Card className="admin-rentals__stat-card card-custom">
                        <Card.Body className="p-3">
                            <div className="text-center">
                                <div className="admin-rentals__stat-number text-success">{formatCurrency(stats.totalRevenue)}</div>
                                <div className="admin-rentals__stat-label text-muted">Общая выручка</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Фильтры */}
            <Card className="admin-rentals__filters-card card-custom mb-4">
                <Card.Body className="p-4">
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="text-muted mb-2">Статус</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="admin-rentals__form-select"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="pending">В ожидании</option>
                                    <option value="active">Активные</option>
                                    <option value="payment_due">Просроченные</option>
                                    <option value="cancelled">Отмененные</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="text-muted mb-2">Даты</Form.Label>
                                <Form.Select
                                    value={filters.dateRange}
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                    className="admin-rentals__form-select"
                                >
                                    <option value="all">Все даты</option>
                                    <option value="today">Сегодня</option>
                                    <option value="week">Эта неделя</option>
                                    <option value="month">Этот месяц</option>
                                    <option value="expiring">Истекающие</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="text-muted mb-2">Поиск</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск по имени, email или сайту..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="admin-rentals__form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Таблица аренд */}
            <Card className="admin-rentals__table-card card-custom">
                <Card.Body className="p-0">
                    {filteredRentals.length > 0 ? (
                        <div className="table-responsive">
                            <Table responsive className="admin-rentals__table mb-0">
                                <thead>
                                <tr>
                                    <th className="admin-rentals__table-header">Клиент</th>
                                    <th className="admin-rentals__table-header">Сайт</th>
                                    <th className="admin-rentals__table-header">Цена</th>
                                    <th className="admin-rentals__table-header">Статус</th>
                                    <th className="admin-rentals__table-header">Даты</th>
                                    <th className="admin-rentals__table-header">Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRentals.map(rental => {
                                    const daysRemaining = getDaysRemaining(rental.rentalEndDate);
                                    const isExpiring = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

                                    return (
                                        <tr key={rental._id} className="admin-rentals__table-row">
                                            <td className="admin-rentals__table-cell">
                                                <div className="admin-rentals__client-info">
                                                    <div className="admin-rentals__client-name text-muted">{rental.clientName}</div>
                                                    <div className="admin-rentals__client-email text-primary small">{rental.clientEmail}</div>
                                                    {rental.clientPhone && (
                                                        <div className="admin-rentals__client-phone text-muted small">{rental.clientPhone}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-rentals__table-cell">
                                                <div className="admin-rentals__site-info">
                                                    {rental.siteId?.title ? (
                                                        <>
                                                            <div className="admin-rentals__site-title">{rental.siteId.title}</div>
                                                            <Badge bg="outline-primary" className="admin-rentals__site-category">
                                                                {rental.siteId.category}
                                                            </Badge>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted">Сайт удален</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-rentals__table-cell">
                                                <div className="admin-rentals__price-info">
                                                    <div className="admin-rentals__monthly-price text-primary">
                                                        {formatCurrency(rental.monthlyPrice)}/мес
                                                    </div>
                                                    {rental.totalPaid > 0 && (
                                                        <div className="admin-rentals__total-paid text-success small">
                                                            Оплачено: {formatCurrency(rental.totalPaid)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-rentals__table-cell">
                                                <div className="d-flex flex-column gap-1">
                                                    {getStatusBadge(rental.status)}
                                                    {isExpiring && rental.status === 'active' && (
                                                        <Badge bg="warning" className="admin-rentals__expiring-badge">
                                                            {daysRemaining} дн.
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-rentals__table-cell">
                                                <div className="admin-rentals__dates-info">
                                                    <div className="admin-rentals__date-item">
                                                        <span className="text-muted small">Начало:</span>
                                                        <span className="ms-2">{formatDate(rental.rentalStartDate)}</span>
                                                    </div>
                                                    <div className="admin-rentals__date-item">
                                                        <span className="text-muted small">Окончание:</span>
                                                        <span className="ms-2">{formatDate(rental.rentalEndDate)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-rentals__table-cell">
                                                <div className="admin-rentals__action-buttons d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => handleViewDetails(rental)}
                                                        className="admin-rentals__view-btn"
                                                    >
                                                        Просмотр
                                                    </Button>
                                                    <Dropdown>
                                                        <Dropdown.Toggle size="sm" variant="outline-secondary" className="admin-rentals__dropdown-btn">
                                                            Действия
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onClick={() => updateRentalStatus(rental._id, 'pending')}
                                                                disabled={rental.status === 'pending'}
                                                                className={rental.status === 'pending' ? 'text-muted' : ''}
                                                            >
                                                                <i className="bi bi-clock me-2"></i>
                                                                Вернуть в ожидание
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                onClick={() => updateRentalStatus(rental._id, 'active')}
                                                                disabled={rental.status === 'active'}
                                                                className={rental.status === 'active' ? 'text-muted' : ''}
                                                            >
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                Активировать
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                onClick={() => updateRentalStatus(rental._id, 'payment_due')}
                                                                disabled={rental.status === 'payment_due'}
                                                                className={rental.status === 'payment_due' ? 'text-muted' : ''}
                                                            >
                                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                                Отметить как просроченную
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                onClick={() => updateRentalStatus(rental._id, 'cancelled')}
                                                                disabled={rental.status === 'cancelled'}
                                                                className={rental.status === 'cancelled' ? 'text-muted' : ''}
                                                            >
                                                                <i className="bi bi-x-circle me-2"></i>
                                                                Отменить
                                                            </Dropdown.Item>

                                                            <Dropdown.Divider />
                                                            <Dropdown.Item onClick={() => {
                                                                setSelectedRental(rental);
                                                                setShowPaymentModal(true);
                                                            }}>
                                                                <i className="bi bi-credit-card me-2"></i>
                                                                Добавить платеж
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => {
                                                                setSelectedRental(rental);
                                                                setDatesData({
                                                                    rentalStartDate: rental.rentalStartDate || '',
                                                                    rentalEndDate: rental.rentalEndDate || ''
                                                                });
                                                                setShowDatesModal(true);
                                                            }}>
                                                                <i className="bi bi-calendar-range me-2"></i>
                                                                Изменить даты
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>

                            {/* Пагинация */}
                            {pagination.totalPages > 1 && (
                                <div className="admin-rentals__pagination d-flex justify-content-center align-items-center gap-3 mt-3 p-3 border-top">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Назад
                                    </Button>
                                    <span className="text-muted">
                                        Страница {pagination.page} из {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="admin-rentals__no-data text-center py-5">
                            <p className="text-muted">Аренд, соответствующих критериям, не найдено.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Модальное окно деталей аренды */}
            <Modal
                show={showDetailModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                className="admin-rentals__modal"
            >
                <Modal.Header closeButton className="border-bottom bg-gradient-bg-modals">
                    <Modal.Title className="text-gradient mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Детали аренды
                    </Modal.Title>
                    {selectedRental && (
                        <div className="ms-auto">
                            {getStatusBadge(selectedRental.status)}
                        </div>
                    )}
                </Modal.Header>

                {selectedRental && (
                    <Modal.Body className="p-0">
                        {/* Блок с основной информацией */}
                        <div className="p-4 bg-gradient-bg-light border-bottom">
                            <Row className="g-4">
                                {/* Информация о клиенте */}
                                <Col lg={6}>
                                    <div className="card-custom p-3 h-100">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-primary-transparent rounded-circle p-2 me-3">
                                                <i className="bi bi-person text-primary fs-4"></i>
                                            </div>
                                            <h6 className="highlight-text mb-0">Информация о клиенте</h6>
                                        </div>

                                        <div className="admin-rentals__client-details">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-person-circle text-muted me-2"></i>
                                                <div>
                                                    <div className="fw-bold text-dark">{selectedRental.clientName}</div>
                                                    <small className="text-muted">Клиент</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-envelope text-muted me-2"></i>
                                                <div>
                                                    <div className="text-primary">{selectedRental.clientEmail}</div>
                                                    <small className="text-muted">Email</small>
                                                </div>
                                            </div>

                                            {selectedRental.clientPhone && (
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-telephone text-muted me-2"></i>
                                                    <div>
                                                        <div className="text-dark">{selectedRental.clientPhone}</div>
                                                        <small className="text-muted">Телефон</small>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRental.userId?.username && (
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-person-badge text-muted me-2"></i>
                                                    <div>
                                                        <div className="text-dark">{selectedRental.userId.username}</div>
                                                        <small className="text-muted">Аккаунт</small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Col>

                                {/* Информация о сайте */}
                                <Col lg={6}>
                                    <div className="card-custom p-3 h-100">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-primary-transparent rounded-circle p-2 me-3">
                                                <i className="bi bi-globe text-primary fs-4"></i>
                                            </div>
                                            <h6 className="highlight-text mb-0">Информация о сайте</h6>
                                        </div>

                                        {selectedRental.siteId ? (
                                            <div className="admin-rentals__site-details">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-tag text-muted me-2"></i>
                                                    <div>
                                                        <div className="fw-bold text-dark">{selectedRental.siteId.title}</div>
                                                        <small className="text-muted">Название сайта</small>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-grid text-muted me-2"></i>
                                                    <div>
                                                        <Badge bg="primary" className="badge-primary">
                                                            {selectedRental.siteId.category}
                                                        </Badge>
                                                        <div className="text-muted small mt-1">Категория</div>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-cash text-muted me-2"></i>
                                                    <div>
                                                        <div className="text-primary fw-bold">
                                                            {formatCurrency(selectedRental.monthlyPrice)} <small className="text-muted">/месяц</small>
                                                        </div>
                                                        <small className="text-muted">Месячная аренда</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-3">
                                                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-2"></i>
                                                <p className="text-muted mb-0">Информация о сайте недоступна</p>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Финансовая информация и даты */}
                        <div className="p-4">
                            <Row className="g-4 mb-4">
                                {/* Финансовая информация */}
                                <Col lg={8}>
                                    <div className="card-custom p-4 h-100">
                                        <h6 className="highlight-text mb-4 d-flex align-items-center">
                                            <i className="bi bi-currency-exchange me-2"></i>
                                            Финансовая информация
                                        </h6>

                                        <Row className="g-3">
                                            <Col md={4}>
                                                <div className="text-center p-3 bg-primary-transparent rounded-lg">
                                                    <div className="text-muted small mb-1">Месячная цена</div>
                                                    <div className="text-primary fw-bold fs-5">
                                                        {formatCurrency(selectedRental.monthlyPrice)}
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col md={4}>
                                                <div className="text-center p-3 bg-success-transparent rounded-lg">
                                                    <div className="text-muted small mb-1">Всего оплачено</div>
                                                    <div className="text-success fw-bold fs-5">
                                                        {formatCurrency(selectedRental.totalPaid)}
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col md={4}>
                                                <div className="text-center p-3 bg-info-transparent rounded-lg">
                                                    <div className="text-muted small mb-1">Последний платеж</div>
                                                    <div className="text-info fw-bold fs-5">
                                                        {formatDate(selectedRental.lastPaymentDate)}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Даты и статус */}
                                <Col lg={4}>
                                    <div className="card-custom p-4 h-100">
                                        <h6 className="highlight-text mb-4 d-flex align-items-center">
                                            <i className="bi bi-calendar-week me-2"></i>
                                            Даты аренды и статус
                                        </h6>

                                        <div className="admin-rentals__dates-details">
                                            <div className="mb-3">
                                                <div className="text-muted small mb-1">Начало аренды</div>
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-calendar-plus text-primary me-2"></i>
                                                    <span className="fw-bold">{formatDate(selectedRental.rentalStartDate)}</span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-muted small mb-1">Окончание аренды</div>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-calendar-check text-primary me-2"></i>
                                                        <span className="fw-bold">{formatDate(selectedRental.rentalEndDate)}</span>
                                                    </div>
                                                    {selectedRental.rentalEndDate && (
                                                        <Badge bg={getDaysRemaining(selectedRental.rentalEndDate) <= 3 ? 'warning' : 'info'}>
                                                            {getDaysRemaining(selectedRental.rentalEndDate)} дн.
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Внутри Modal.Body, где отображается текущий статус */}
                                            <div className="mt-4 pt-3 border-top">
                                                <div className="text-muted small mb-2">Текущий статус</div>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-info-circle text-primary me-2"></i>
                                                        <span className="fw-bold">{getStatusText(selectedRental.status)}</span>
                                                    </div>
                                                    {getStatusBadge(selectedRental.status)}
                                                </div>

                                                {/* Кнопки для изменения статуса */}
                                                <div className="d-grid gap-2">
                                                    {selectedRental.status !== 'pending' && (
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            onClick={() => updateRentalStatus(selectedRental._id, 'pending')}
                                                            className="w-100 d-flex align-items-center justify-content-center"
                                                        >
                                                            <i className="bi bi-clock me-2"></i>
                                                            Вернуть в ожидание
                                                        </Button>
                                                    )}

                                                    {selectedRental.status !== 'active' && selectedRental.status !== 'cancelled' && (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => updateRentalStatus(selectedRental._id, 'active')}
                                                            className="w-100 d-flex align-items-center justify-content-center mt-2"
                                                        >
                                                            <i className="bi bi-check-circle me-2"></i>
                                                            Активировать аренду
                                                        </Button>
                                                    )}

                                                    {selectedRental.status !== 'payment_due' && selectedRental.status !== 'cancelled' && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => updateRentalStatus(selectedRental._id, 'payment_due')}
                                                            className="w-100 d-flex align-items-center justify-content-center mt-2"
                                                        >
                                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                                            Отметить как просроченную
                                                        </Button>
                                                    )}

                                                    {selectedRental.status !== 'cancelled' && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => updateRentalStatus(selectedRental._id, 'cancelled')}
                                                            className="w-100 d-flex align-items-center justify-content-center mt-2"
                                                        >
                                                            <i className="bi bi-x-circle me-2"></i>
                                                            Отменить аренду
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Информация для активных аренд */}
                                                {selectedRental.status === 'active' && (
                                                    <div className="mt-3">
                                                        <div className="text-muted small mb-1">Последний платеж</div>
                                                        <div className="text-success small">
                                                            {selectedRental.lastPaymentDate
                                                                ? formatDate(selectedRental.lastPaymentDate)
                                                                : 'Нет данных'
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Заметки клиента */}
                            {selectedRental.notes && (
                                <div className="card-custom p-4 mb-4">
                                    <h6 className="highlight-text mb-3 d-flex align-items-center">
                                        <i className="bi bi-chat-left-text me-2"></i>
                                        Заметки клиента
                                    </h6>
                                    <div className="admin-rentals__notes p-3 bg-secondary-bg rounded">
                                        <div className="d-flex align-items-start">
                                            <i className="bi bi-quote text-muted me-2 mt-1"></i>
                                            <div className="text-dark" style={{ lineHeight: '1.6' }}>
                                                {selectedRental.notes}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* История платежей */}
                            <div className="card-custom p-4">
                                <h6 className="highlight-text mb-4 d-flex align-items-center">
                                    <i className="bi bi-clock-history me-2"></i>
                                    История платежей
                                </h6>

                                {selectedRental.payments?.length > 0 ? (
                                    <div className="admin-rentals__payments-history">
                                        {selectedRental.payments.map((payment, index) => (
                                            <div key={index} className="admin-rentals__payment-item card-custom p-3 mb-3 hover-lift">
                                                <Row className="align-items-center">
                                                    <Col md={4}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-success-transparent rounded-circle p-2 me-3">
                                                                <i className="bi bi-check-circle text-success"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-success">
                                                                    {formatCurrency(payment.amount)}
                                                                </div>
                                                                <small className="text-muted">Сумма</small>
                                                            </div>
                                                        </div>
                                                    </Col>

                                                    <Col md={3}>
                                                        <div className="text-muted small">Способ оплаты</div>
                                                        <div className="text-dark fw-bold">{payment.paymentMethod}</div>
                                                    </Col>

                                                    <Col md={3}>
                                                        <div className="text-muted small">Период</div>
                                                        <div className="text-dark fw-bold">
                                                            {payment.periodMonths} месяц(а)
                                                        </div>
                                                    </Col>

                                                    <Col md={2}>
                                                        <div className="text-muted small">Дата</div>
                                                        <div className="text-dark fw-bold">
                                                            {formatDate(payment.paymentDate)}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {payment.notes && (
                                                    <div className="mt-2 pt-2 border-top">
                                                        <div className="text-muted small mb-1">Примечание:</div>
                                                        <div className="text-dark small">{payment.notes}</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bi bi-wallet2 text-muted fs-1 mb-3"></i>
                                        <p className="text-muted mb-0">История платежей отсутствует</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                )}

                <Modal.Footer className="border-top bg-gradient-bg-modals">
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    setShowPaymentModal(true);
                                    setShowDetailModal(false);
                                }}
                                className="btn-outline-custom d-flex align-items-center"
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Добавить платеж
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setDatesData({
                                        rentalStartDate: selectedRental?.rentalStartDate || '',
                                        rentalEndDate: selectedRental?.rentalEndDate || ''
                                    });
                                    setShowDatesModal(true);
                                    setShowDetailModal(false);
                                }}
                                className="btn-outline-custom d-flex align-items-center"
                            >
                                <i className="bi bi-calendar-range me-2"></i>
                                Изменить даты
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleCloseModal}
                            className="btn-outline-custom d-flex align-items-center"
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Закрыть
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Модальное окно добавления платежа */}
            <Modal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                centered
            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="text-gradient">
                        Добавить платеж
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Сумма (₸)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    amount: parseFloat(e.target.value) || ''
                                }))}
                                placeholder="Введите сумму"
                                className="card-custom"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Способ оплаты</Form.Label>
                            <Form.Select
                                value={paymentData.paymentMethod}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    paymentMethod: e.target.value
                                }))}
                                className="card-custom"
                            >
                                <option value="bank_transfer">Банковский перевод</option>
                                <option value="card">Кредитная карта</option>
                                <option value="cash">Наличные</option>
                                <option value="other">Другое</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Месяцев продления (опционально)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={paymentData.periodMonths}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    periodMonths: parseInt(e.target.value) || ''
                                }))}
                                placeholder="Автоматический расчет"
                                className="card-custom"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Заметки</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Заметки о платеже"
                                className="card-custom"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)} className="btn-outline-custom">
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleAddPayment} className="btn-primary-custom">
                        Добавить платеж
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальное окно изменения дат */}
            <Modal
                show={showDatesModal}
                onHide={() => setShowDatesModal(false)}
                centered
            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="text-gradient">
                        Изменить даты аренды
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Дата начала</Form.Label>
                            <Form.Control
                                type="date"
                                value={datesData.rentalStartDate ? new Date(datesData.rentalStartDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setDatesData(prev => ({
                                    ...prev,
                                    rentalStartDate: e.target.value
                                }))}
                                className="card-custom"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Дата окончания</Form.Label>
                            <Form.Control
                                type="date"
                                value={datesData.rentalEndDate ? new Date(datesData.rentalEndDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setDatesData(prev => ({
                                    ...prev,
                                    rentalEndDate: e.target.value
                                }))}
                                className="card-custom"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button variant="secondary" onClick={() => setShowDatesModal(false)} className="btn-outline-custom">
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleUpdateDates} className="btn-primary-custom">
                        Сохранить изменения
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminRentals;