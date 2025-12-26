import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { contactAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminContacts.css';

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const { loading, startLoading, stopLoading } = useLoading();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'bank_transfer',
        periodMonths: '',
        notes: ''
    });
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    // Функция для загрузки платежей
    const loadPayments = async (contactId) => {
        setLoadingPayments(true);
        try {
            const response = await contactAPI.getPayments(contactId);
            setPayments(response.data.payments);
        } catch (error) {
            console.error('Ошибка при загрузке платежей:', error);
        } finally {
            setLoadingPayments(false);
        }
    };

    // Загружаем платежи при открытии модального окна
    useEffect(() => {
        if (selectedContact && showDetailModal) {
            loadPayments(selectedContact._id);
        }
    }, [selectedContact, showDetailModal]);

    // Функция для добавления платежа
    const handleAddPayment = async () => {
        if (!paymentData.amount || paymentData.amount <= 0) {
            toast.error('Пожалуйста, введите корректную сумму');
            return;
        }

        try {
            await contactAPI.addPayment(selectedContact._id, paymentData);
            toast.success('Платеж успешно добавлен');
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                paymentMethod: 'bank_transfer',
                periodMonths: '',
                notes: ''
            });
            fetchContacts();
            if (selectedContact) {
                // Обновляем выбранный контакт
                const updated = await contactAPI.getById(selectedContact._id);
                setSelectedContact(updated.data.contact);
                // Перезагружаем платежи
                loadPayments(selectedContact._id);
            }
        } catch (error) {
            toast.error('Не удалось добавить платеж');
            console.error('Ошибка платежа:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
        // eslint-disable-next-line
    }, [pagination.page, filters]);

    const fetchContacts = async () => {
        startLoading();
        try {
            const params = {
                page: pagination.page,
                limit: 10,
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            };

            const response = await contactAPI.getAll(params);
            setContacts(response.data.contacts);
            setFilteredContacts(response.data.contacts);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                total: response.data.total
            }));
        } catch (error) {
            toast.error('Не удалось получить контакты');
            console.error('Ошибка при загрузке контактов:', error);
        } finally {
            stopLoading();
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleViewDetails = (contact) => {
        setSelectedContact(contact);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedContact(null);
        setPayments([]);
    };

    const updateContactStatus = async (contactId, newStatus) => {
        try {
            await contactAPI.update(contactId, { status: newStatus });
            toast.success(`Контакт отмечен как ${newStatus}`);
            fetchContacts();
            if (selectedContact?._id === contactId) {
                setSelectedContact(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Не удалось обновить статус контакта.');
            console.error('Ошибка обновления статуса контакта:', error);
        }
    };

    const addNote = async (contactId, note) => {
        try {
            await contactAPI.update(contactId, { notes: note });
            toast.success('Примечание успешно добавлено');
            fetchContacts();
            if (selectedContact?._id === contactId) {
                setSelectedContact(prev => ({ ...prev, notes: note }));
            }
        } catch (error) {
            toast.error('Не удалось добавить заметку');
            console.error('Ошибка добавления примечания:', error);
        }
    };

    const deleteContact = async (contactId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот контакт?')) {
            try {
                await contactAPI.delete(contactId);
                toast.success('Контакт успешно удален');
                fetchContacts();
                if (selectedContact?._id === contactId) {
                    handleCloseModal();
                }
            } catch (error) {
                toast.error('Не удалось удалить контакт.');
                console.error('Ошибка при удалении контакта:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusTranslations = {
            new: 'новый',
            active_rental: 'активная аренда',
            payment_due: 'ожидает оплаты'
        };

        const variants = {
            new: 'danger',
            active_rental: 'info',
            payment_due: 'warning'
        };

        return (
            <Badge
                bg={variants[status] || 'secondary'}
                className="admin-contacts__status-badge"
            >
                {statusTranslations[status] || status}
            </Badge>
        );
    };

    // Функция для расчета оставшихся дней
    const getDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading && contacts.length === 0) {
        return (
            <div className="admin-contacts__loading text-center py-5">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted">Загрузка контактов...</p>
            </div>
        );
    }

    const getPaymentMethodText = (method) => {
        const translations = {
            'bank_transfer': 'банковский перевод',
            'card': 'кредитная карта',
            'cash': 'наличные',
            'other': 'другое'
        };

        return translations[method] || method;
    };

    return (
        <div className="admin-contacts container-custom py-4">
            <div className="admin-contacts__header mb-4">
                <h1 className="admin-contacts__title section-title mb-0">Управление контактами</h1>
                <div className="admin-contacts__stats">
                    <Badge bg="outline-info" className="admin-contacts__stat-badge">
                        Всего: {pagination.total}
                    </Badge>
                </div>
            </div>

            {/* Фильтры */}
            <Card className="admin-contacts__filters-card card-custom mb-4">
                <Card.Body className="admin-contacts__filters-card-body p-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="admin-contacts__form-group">
                                <Form.Label className="admin-contacts__form-label text-light mb-2">Статус</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="admin-contacts__form-select"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="new">Новый</option>
                                    <option value="active_rental">Активная аренда</option>
                                    <option value="payment_due">Ожидает оплаты</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="admin-contacts__form-group">
                                <Form.Label className="admin-contacts__form-label text-light mb-2">Поиск</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск по имени, email или сообщению..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="admin-contacts__form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Таблица контактов */}
            <Card className="admin-contacts__table-card card-custom">
                <Card.Body className="admin-contacts__table-card-body p-0">
                    {filteredContacts.length > 0 ? (
                        <div className="table-responsive">
                            <Table responsive className="admin-contacts__table mb-0">
                                <thead>
                                <tr>
                                    <th className="admin-contacts__table-header">Контактная информация</th>
                                    <th className="admin-contacts__table-header">Сайт</th>
                                    <th className="admin-contacts__table-header">Статус</th>
                                    <th className="admin-contacts__table-header">Дата</th>
                                    <th className="admin-contacts__table-header">Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredContacts.map(contact => (
                                    <tr key={contact._id} className="admin-contacts__table-row">
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__contact-info">
                                                <div className="admin-contacts__contact-name text-light mb-1">{contact.name}</div>
                                                <div className="admin-contacts__contact-email text-primary mb-1">{contact.email}</div>
                                                {contact.phone && (
                                                    <div className="admin-contacts__contact-phone text-muted">{contact.phone}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            {contact.siteTitle ? (
                                                <div className="admin-contacts__site-info">
                                                    <Badge bg="outline-primary" className="admin-contacts__site-badge">
                                                        {contact.siteTitle}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="admin-contacts__no-website text-muted">Общий запрос</span>
                                            )}
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            <div className="d-flex flex-column gap-1">
                                                {getStatusBadge(contact.status)}
                                                {contact.rentalEndDate && getDaysRemaining(contact.rentalEndDate) !== null && (
                                                    <Badge
                                                        bg={getDaysRemaining(contact.rentalEndDate) <= 3 ? 'warning' : 'info'}
                                                        className="admin-contacts__days-badge"
                                                    >
                                                        {getDaysRemaining(contact.rentalEndDate)} дн.
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__date-info">
                                                <div className="text-light">{new Date(contact.createdAt).toLocaleDateString()}</div>
                                                <small className="admin-contacts__date-time text-muted">
                                                    {new Date(contact.createdAt).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__action-buttons d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleViewDetails(contact)}
                                                    className="admin-contacts__view-btn btn-outline-custom"
                                                >
                                                    Просмотр
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => deleteContact(contact._id)}
                                                    className="admin-contacts__delete-btn btn-outline-custom"
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            {/* Пагинация */}
                            {pagination.totalPages > 1 && (
                                <div className="admin-contacts__pagination-container d-flex justify-content-center align-items-center gap-3 mt-3 p-3 border-top">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        className="admin-contacts__pagination-btn btn-outline-custom"
                                    >
                                        Назад
                                    </Button>
                                    <span className="admin-contacts__pagination-info text-muted">
                                        Страница {pagination.page} из {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        className="admin-contacts__pagination-btn btn-outline-custom"
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="admin-contacts__no-data text-center py-5">
                            <p className="text-muted">Контактов, соответствующих критериям, не найдено.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Модальное окно деталей контакта */}
            <Modal
                show={showDetailModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                className="admin-contacts__modal"
            >
                <Modal.Header closeButton className="admin-contacts__modal-header border-bottom">
                    <Modal.Title className="admin-contacts__modal-title text-gradient">
                        Детали контакта
                    </Modal.Title>
                </Modal.Header>
                {selectedContact && (
                    <>
                        <Modal.Body className="admin-contacts__modal-body">
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <div className="admin-contacts__detail-section">
                                        <h6 className="admin-contacts__detail-section-title highlight-text">Личная информация</h6>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label text-light">Имя:</strong>
                                            <span className="text-light ms-2">{selectedContact.name}</span>
                                        </div>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label text-light">Email:</strong>
                                            <span className="text-primary ms-2">{selectedContact.email}</span>
                                        </div>
                                        {selectedContact.phone && (
                                            <div className="admin-contacts__detail-item">
                                                <strong className="admin-contacts__detail-label text-light">Телефон:</strong>
                                                <span className="text-light ms-2">{selectedContact.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="admin-contacts__detail-section">
                                        <h6 className="admin-contacts__detail-section-title highlight-text">Информация о запросе</h6>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label text-light">Статус:</strong>
                                            <div className="admin-contacts__status-actions mt-2">
                                                {getStatusBadge(selectedContact.status)}
                                                <div className="admin-contacts__status-buttons d-flex flex-wrap gap-1 mt-2">
                                                    {['new', 'active_rental', 'payment_due'].map(status => (
                                                        <Button
                                                            key={status}
                                                            size="sm"
                                                            variant={selectedContact.status === status ? 'primary' : 'outline-primary'}
                                                            onClick={() => updateContactStatus(selectedContact._id, status)}
                                                            className="admin-contacts__status-btn btn-primary-custom btn-sm"
                                                        >
                                                            {status === 'new' ? 'новый' :
                                                                status === 'active_rental' ? 'активная аренда' :
                                                                    'ожидает оплаты'}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedContact.siteTitle && (
                                            <div className="admin-contacts__detail-item">
                                                <strong className="admin-contacts__detail-label text-light">Сайт:</strong>
                                                <span className="text-light ms-2">{selectedContact.siteTitle}</span>
                                            </div>
                                        )}
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label text-light">Отправлено:</strong>
                                            <span className="text-light ms-2">{new Date(selectedContact.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Раздел информации об аренде */}
                            <div className="admin-contacts__detail-section mb-4">
                                <h6 className="admin-contacts__detail-section-title highlight-text mb-3">Информация об аренде</h6>

                                <div className="admin-contacts__rental-info card-custom p-3 mb-3">
                                    <Row className="g-3">
                                        {selectedContact.monthlyPrice > 0 && (
                                            <Col md={6}>
                                                <div className="admin-contacts__rental-date-item">
                                                    <div className="admin-contacts__rental-label text-muted">Ежемесячная цена:</div>
                                                    <div className="admin-contacts__rental-value text-primary">₸{selectedContact.monthlyPrice}</div>
                                                </div>
                                            </Col>
                                        )}
                                        {selectedContact.rentalEndDate && (
                                            <Col md={6}>
                                                <div className="admin-contacts__rental-date-item">
                                                    <div className="admin-contacts__rental-label text-muted">Аренда заканчивается:</div>
                                                    <div className="admin-contacts__rental-value text-light">
                                                        {new Date(selectedContact.rentalEndDate).toLocaleDateString()}
                                                        {getDaysRemaining(selectedContact.rentalEndDate) !== null && (
                                                            <Badge
                                                                bg={getDaysRemaining(selectedContact.rentalEndDate) <= 3 ? 'warning' : 'info'}
                                                                className="ms-2"
                                                            >
                                                                {getDaysRemaining(selectedContact.rentalEndDate)} дней осталось
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                        )}
                                        {selectedContact.totalPaid > 0 && (
                                            <Col md={6}>
                                                <div className="admin-contacts__rental-date-item">
                                                    <div className="admin-contacts__rental-label text-muted">Всего оплачено:</div>
                                                    <div className="admin-contacts__rental-value text-success">₸{selectedContact.totalPaid}</div>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => setShowPaymentModal(true)}
                                        className="btn-primary-custom"
                                    >
                                        Добавить платеж
                                    </Button>
                                </div>
                            </div>

                            {/* Раздел истории платежей */}
                            <div className="admin-contacts__detail-section mb-4">
                                <h6 className="admin-contacts__detail-section-title highlight-text mb-3">История платежей</h6>

                                {loadingPayments ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" variant="primary" />
                                    </div>
                                ) : payments.length > 0 ? (
                                    <div className="admin-contacts__payment-history">
                                        {payments.map((payment, index) => (
                                            <div key={index} className="admin-contacts__payment-item card-custom p-3 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="admin-contacts__payment-amount text-primary mb-1">
                                                            ₸{payment.amount}
                                                        </div>
                                                        <div className="admin-contacts__payment-date text-muted small small-admin-contacts__payment-date">
                                                            {new Date(payment.paymentDate).toLocaleDateString()} •
                                                            {payment.periodMonths} месяц(а) • {getPaymentMethodText(payment.paymentMethod)}
                                                        </div>
                                                        {payment.notes && (
                                                            <div className="text-muted small mt-1 small-admin-notes__payment-date">
                                                                {payment.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge bg="info" className="admin-contacts__payment-rate">
                                                        ₸{(payment.amount / payment.periodMonths).toFixed(2)}/месяц
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="admin-contacts__payment-total mt-3 p-3 card-custom">
                                            <div className="d-flex justify-content-between">
                                                <strong className="text-light">Всего оплачено:</strong>
                                                <strong className="text-success">
                                                    ₸{payments.reduce((sum, payment) => sum + payment.amount, 0)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-3 card-custom">
                                        <p className="text-muted mb-0">Платежи еще не зарегистрированы</p>
                                    </div>
                                )}
                            </div>

                            <div className="admin-contacts__detail-section mb-4">
                                <h6 className="admin-contacts__detail-section-title highlight-text mb-3">Сообщение</h6>
                                <div className="admin-contacts__message-content card-custom p-3">
                                    {selectedContact.message}
                                </div>
                            </div>

                            {selectedContact.notes && (
                                <div className="admin-contacts__detail-section mb-4">
                                    <h6 className="admin-contacts__detail-section-title highlight-text mb-3">Заметки администратора</h6>
                                    <div className="admin-contacts__notes-content card-custom p-3">
                                        {selectedContact.notes}
                                    </div>
                                </div>
                            )}

                            <div className="admin-contacts__detail-section">
                                <h6 className="admin-contacts__detail-section-title highlight-text mb-3">Добавить заметку</h6>
                                <Form.Group className="admin-contacts__form-group">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Добавьте внутренние заметки об этом контакте..."
                                        onBlur={(e) => addNote(selectedContact._id, e.target.value)}
                                        defaultValue={selectedContact.notes || ''}
                                        className="admin-contacts__notes-textarea card-custom"
                                    />
                                </Form.Group>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="admin-contacts__modal-footer border-top">
                            <Button
                                variant="outline-secondary"
                                onClick={handleCloseModal}
                                className="admin-contacts__modal-close-btn btn-outline-custom"
                            >
                                Закрыть
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => deleteContact(selectedContact._id)}
                                className="admin-contacts__modal-delete-btn btn-primary-custom"
                            >
                                Удалить контакт
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Модальное окно добавления платежа */}
            <Modal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                centered
                className="admin-contacts__modal"
            >
                <Modal.Header closeButton className="admin-contacts__modal-header border-bottom">
                    <Modal.Title className="admin-contacts__modal-title text-gradient">
                        Добавить платеж для {selectedContact?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="admin-contacts__modal-body">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-light mb-2">Сумма платежа (₸)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    amount: parseFloat(e.target.value) || ''
                                }))}
                                placeholder="Введите сумму платежа"
                                className="card-custom"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-light mb-2">Способ оплаты</Form.Label>
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
                            <Form.Label className="text-light mb-2">Месяцев продления (опционально)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={paymentData.periodMonths}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    periodMonths: parseInt(e.target.value) || ''
                                }))}
                                placeholder="Автоматически рассчитывается из суммы"
                                className="card-custom"
                            />
                            <Form.Text className="text-muted small d-block mt-1 small-form-text">
                                Оставьте пустым для автоматического расчета на основе ежемесячной цены
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-light mb-2">Заметки</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Заметки о платеже..."
                                className="card-custom"
                            />
                        </Form.Group>
                    </Form>

                    {selectedContact?.monthlyPrice && paymentData.amount && (
                        <div className="alert alert-info card-custom mt-3">
                            <strong>Расчет:</strong> ₸{paymentData.amount} / ₸{selectedContact.monthlyPrice} =
                            {Math.floor(paymentData.amount / selectedContact.monthlyPrice)} месяц(а)
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="admin-contacts__modal-footer border-top">
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)} className="btn-outline-custom">
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleAddPayment} className="btn-primary-custom">
                        Добавить платеж
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminContacts;