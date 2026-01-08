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
            // Обновляем выбранную аренду
            if (selectedRental) {
                const updated = await rentalAPI.getById(selectedRental._id);
                setSelectedRental(updated.data.rental);
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
            // Обновляем выбранную аренду
            if (selectedRental) {
                const updated = await rentalAPI.getById(selectedRental._id);
                setSelectedRental(updated.data.rental);
            }
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
                                                            <Dropdown.Item onClick={() => updateRentalStatus(rental._id, 'active')}>
                                                                Активировать
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => updateRentalStatus(rental._id, 'payment_due')}>
                                                                Отметить как просроченную
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => updateRentalStatus(rental._id, 'cancelled')}>
                                                                Отменить
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item onClick={() => {
                                                                setSelectedRental(rental);
                                                                setShowPaymentModal(true);
                                                            }}>
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
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="text-gradient">
                        Детали аренды
                    </Modal.Title>
                </Modal.Header>
                {selectedRental && (
                    <Modal.Body>
                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <div className="admin-rentals__detail-section">
                                    <h6 className="highlight-text mb-3">Информация о клиенте</h6>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Имя:</strong>
                                        <span className="ms-2">{selectedRental.clientName}</span>
                                    </div>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Email:</strong>
                                        <span className="ms-2 text-primary">{selectedRental.clientEmail}</span>
                                    </div>
                                    {selectedRental.clientPhone && (
                                        <div className="admin-rentals__detail-item">
                                            <strong className="text-muted">Телефон:</strong>
                                            <span className="ms-2">{selectedRental.clientPhone}</span>
                                        </div>
                                    )}
                                    {selectedRental.userId?.username && (
                                        <div className="admin-rentals__detail-item">
                                            <strong className="text-muted">Аккаунт:</strong>
                                            <span className="ms-2">{selectedRental.userId.username}</span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="admin-rentals__detail-section">
                                    <h6 className="highlight-text mb-3">Информация о сайте</h6>
                                    {selectedRental.siteId ? (
                                        <>
                                            <div className="admin-rentals__detail-item">
                                                <strong className="text-muted">Название:</strong>
                                                <span className="ms-2">{selectedRental.siteId.title}</span>
                                            </div>
                                            <div className="admin-rentals__detail-item">
                                                <strong className="text-muted">Категория:</strong>
                                                <Badge bg="outline-primary" className="ms-2">
                                                    {selectedRental.siteId.category}
                                                </Badge>
                                            </div>
                                            <div className="admin-rentals__detail-item">
                                                <strong className="text-muted">Цена:</strong>
                                                <span className="ms-2 text-primary">
                                                    {formatCurrency(selectedRental.monthlyPrice)}/месяц
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted">Информация о сайте недоступна</p>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="admin-rentals__detail-section mb-4">
                            <h6 className="highlight-text mb-3">Статус и даты</h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Статус:</strong>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            {getStatusBadge(selectedRental.status)}
                                            <div className="admin-rentals__status-buttons d-flex gap-1">
                                                {['pending', 'active', 'payment_due', 'cancelled'].map(status => (
                                                    <Button
                                                        key={status}
                                                        size="sm"
                                                        variant={selectedRental.status === status ? 'primary' : 'outline-primary'}
                                                        onClick={() => updateRentalStatus(selectedRental._id, status)}
                                                        className="btn-primary-custom"
                                                    >
                                                        {getStatusText(status)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Начало:</strong>
                                        <div>{formatDate(selectedRental.rentalStartDate)}</div>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Окончание:</strong>
                                        <div className="d-flex align-items-center gap-2">
                                            {formatDate(selectedRental.rentalEndDate)}
                                            {selectedRental.rentalEndDate && (
                                                <Badge bg={getDaysRemaining(selectedRental.rentalEndDate) <= 3 ? 'warning' : 'info'}>
                                                    {getDaysRemaining(selectedRental.rentalEndDate)} дн.
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {selectedRental.notes && (
                            <div className="admin-rentals__detail-section mb-4">
                                <h6 className="highlight-text mb-3">Заметки клиента</h6>
                                <div className="admin-rentals__notes card-custom p-3">
                                    {selectedRental.notes}
                                </div>
                            </div>
                        )}

                        <div className="admin-rentals__detail-section mb-4">
                            <h6 className="highlight-text mb-3">Финансовая информация</h6>
                            <Row className="g-3">
                                <Col md={4}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Месячная цена:</strong>
                                        <div className="text-primary">{formatCurrency(selectedRental.monthlyPrice)}</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Всего оплачено:</strong>
                                        <div className="text-success">{formatCurrency(selectedRental.totalPaid)}</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="admin-rentals__detail-item">
                                        <strong className="text-muted">Последний платеж:</strong>
                                        <div>{formatDate(selectedRental.lastPaymentDate)}</div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <div className="admin-rentals__detail-section">
                            <h6 className="highlight-text mb-3">История платежей</h6>
                            {selectedRental.payments?.length > 0 ? (
                                selectedRental.payments.map((payment, index) => (
                                    <div key={index} className="admin-rentals__payment-item card-custom p-3 mb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="text-primary mb-1">{formatCurrency(payment.amount)}</div>
                                                <div className="text-muted small">
                                                    {formatDate(payment.paymentDate)} • {payment.periodMonths} месяц(а) • {payment.paymentMethod}
                                                </div>
                                                {payment.notes && (
                                                    <div className="text-muted small mt-1">{payment.notes}</div>
                                                )}
                                            </div>
                                            <Badge bg="info">
                                                {formatCurrency(payment.amount / payment.periodMonths)}/месяц
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">Платежи не найдены</p>
                            )}
                        </div>
                    </Modal.Body>
                )}
                <Modal.Footer className="border-top">
                    <div className="d-flex justify-content-between w-100">
                        <div>
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    setShowPaymentModal(true);
                                    setShowDetailModal(false);
                                }}
                                className="me-2 btn-outline-custom"
                            >
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
                                className="btn-outline-custom"
                            >
                                Изменить даты
                            </Button>
                        </div>
                        <Button variant="secondary" onClick={handleCloseModal} className="btn-outline-custom">
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