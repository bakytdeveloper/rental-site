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
            console.error('Error loading payments:', error);
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
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await contactAPI.addPayment(selectedContact._id, paymentData);
            toast.success('Payment added successfully');
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
            toast.error('Failed to add payment');
            console.error('Payment error:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
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
        setPayments([]); // Очищаем платежи при закрытии
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
        if (window.confirm('Are you sure you want to delete this contact?')) {
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
        const variants = {
            new: 'danger',
            contacted: 'warning',
            completed: 'success',
            spam: 'secondary',
            active_rental: 'info',
            payment_due: 'warning'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
            <div className="admin-contacts__loading">
                <Spinner animation="border" variant="primary" />
                <p>Loading contacts...</p>
            </div>
        );
    }

    return (
        <div className="admin-contacts">
            <div className="admin-contacts__header">
                <h1 className="admin-contacts__title">Contact Management</h1>
                <div className="admin-contacts__stats">
                    <Badge bg="outline-info" className="admin-contacts__stat-badge">
                        Total: {pagination.total}
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <Card className="admin-contacts__filters-card">
                <Card.Body className="admin-contacts__filters-card-body">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="admin-contacts__form-group">
                                <Form.Label className="admin-contacts__form-label">Status</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="admin-contacts__form-select"
                                >
                                    <option value="all">All Status</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="completed">Completed</option>
                                    <option value="spam">Spam</option>
                                    <option value="active_rental">Active Rental</option>
                                    <option value="payment_due">Payment Due</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="admin-contacts__form-group">
                                <Form.Label className="admin-contacts__form-label">Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name, email, or message..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="admin-contacts__form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Contacts Table */}
            <Card className="admin-contacts__table-card">
                <Card.Body className="admin-contacts__table-card-body">
                    {filteredContacts.length > 0 ? (
                        <>
                            <Table responsive className="admin-contacts__table">
                                <thead>
                                <tr>
                                    <th className="admin-contacts__table-header">Contact Info</th>
                                    <th className="admin-contacts__table-header">Website</th>
                                    <th className="admin-contacts__table-header">Status</th>
                                    <th className="admin-contacts__table-header">Date</th>
                                    <th className="admin-contacts__table-header">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredContacts.map(contact => (
                                    <tr key={contact._id} className="admin-contacts__table-row">
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__contact-info">
                                                <div className="admin-contacts__contact-name">{contact.name}</div>
                                                <div className="admin-contacts__contact-email">{contact.email}</div>
                                                {contact.phone && (
                                                    <div className="admin-contacts__contact-phone">{contact.phone}</div>
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
                                                <span className="admin-contacts__no-website">General Inquiry</span>
                                            )}
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            {getStatusBadge(contact.status)}
                                            {contact.rentalEndDate && (
                                                <div className="small mt-1">
                                                    {getDaysRemaining(contact.rentalEndDate) !== null &&
                                                    getDaysRemaining(contact.rentalEndDate) > 0 && (
                                                        <Badge bg={getDaysRemaining(contact.rentalEndDate) <= 3 ? 'warning' : 'info'} className="ms-1">
                                                            {getDaysRemaining(contact.rentalEndDate)}d
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__date-info">
                                                <div>{new Date(contact.createdAt).toLocaleDateString()}</div>
                                                <small className="admin-contacts__date-time">
                                                    {new Date(contact.createdAt).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        </td>
                                        <td className="admin-contacts__table-cell">
                                            <div className="admin-contacts__action-buttons">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleViewDetails(contact)}
                                                    className="admin-contacts__view-btn"
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => deleteContact(contact._id)}
                                                    className="admin-contacts__delete-btn"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="admin-contacts__pagination-container">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        className="admin-contacts__pagination-btn"
                                    >
                                        Previous
                                    </Button>
                                    <span className="admin-contacts__pagination-info">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        className="admin-contacts__pagination-btn"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="admin-contacts__no-data">
                            <p>No contacts found matching your criteria.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Contact Detail Modal */}
            <Modal
                show={showDetailModal}
                onHide={handleCloseModal}
                size="lg"
                className="admin-contacts__modal"
                dialogClassName="admin-contacts__modal-dialog"
            >
                <Modal.Header closeButton className="admin-contacts__modal-header">
                    <Modal.Title className="admin-contacts__modal-title">Contact Details</Modal.Title>
                </Modal.Header>
                {selectedContact && (
                    <>
                        <Modal.Body className="admin-contacts__modal-body">
                            <Row>
                                <Col md={6}>
                                    <div className="admin-contacts__detail-section">
                                        <h6 className="admin-contacts__detail-section-title">Personal Information</h6>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label">Name:</strong> {selectedContact.name}
                                        </div>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label">Email:</strong> {selectedContact.email}
                                        </div>
                                        {selectedContact.phone && (
                                            <div className="admin-contacts__detail-item">
                                                <strong className="admin-contacts__detail-label">Phone:</strong> {selectedContact.phone}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="admin-contacts__detail-section">
                                        <h6 className="admin-contacts__detail-section-title">Request Information</h6>
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label">Status:</strong>
                                            <div className="admin-contacts__status-actions">
                                                {getStatusBadge(selectedContact.status)}
                                                <div className="admin-contacts__status-buttons">
                                                    {['new', 'contacted', 'completed', 'spam', 'active_rental', 'payment_due'].map(status => (
                                                        <Button
                                                            key={status}
                                                            size="sm"
                                                            variant={selectedContact.status === status ? 'primary' : 'outline-primary'}
                                                            onClick={() => updateContactStatus(selectedContact._id, status)}
                                                            className="admin-contacts__status-btn"
                                                        >
                                                            {status}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedContact.siteTitle && (
                                            <div className="admin-contacts__detail-item">
                                                <strong className="admin-contacts__detail-label">Website:</strong> {selectedContact.siteTitle}
                                            </div>
                                        )}
                                        <div className="admin-contacts__detail-item">
                                            <strong className="admin-contacts__detail-label">Submitted:</strong> {new Date(selectedContact.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Rental Information Section */}
                            <div className="admin-contacts__detail-section">
                                <h6 className="admin-contacts__detail-section-title">Rental Information</h6>

                                {selectedContact.monthlyPrice > 0 && (
                                    <div className="admin-contacts__detail-item">
                                        <strong className="admin-contacts__detail-label">Monthly Price:</strong>
                                        ${selectedContact.monthlyPrice}
                                    </div>
                                )}

                                {selectedContact.rentalEndDate && (
                                    <div className="admin-contacts__detail-item">
                                        <strong className="admin-contacts__detail-label">Rental Ends:</strong>
                                        {new Date(selectedContact.rentalEndDate).toLocaleDateString()}
                                        {getDaysRemaining(selectedContact.rentalEndDate) !== null && (
                                            <span className={`ms-2 badge ${getDaysRemaining(selectedContact.rentalEndDate) <= 3 ? 'bg-warning' : 'bg-info'}`}>
                                                {getDaysRemaining(selectedContact.rentalEndDate)} days remaining
                                            </span>
                                        )}
                                    </div>
                                )}

                                {selectedContact.totalPaid > 0 && (
                                    <div className="admin-contacts__detail-item">
                                        <strong className="admin-contacts__detail-label">Total Paid:</strong>
                                        ${selectedContact.totalPaid}
                                    </div>
                                )}

                                <div className="admin-contacts__detail-item">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => setShowPaymentModal(true)}
                                    >
                                        Add Payment
                                    </Button>
                                </div>
                            </div>

                            {/* Payment History Section */}
                            <div className="admin-contacts__detail-section">
                                <h6 className="admin-contacts__detail-section-title">Payment History</h6>

                                {loadingPayments ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" />
                                    </div>
                                ) : payments.length > 0 ? (
                                    <div className="admin-contacts__payment-history">
                                        {payments.map((payment, index) => (
                                            <div key={index} className="admin-contacts__payment-item">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="admin-contacts__payment-amount">
                                                            ${payment.amount}
                                                        </div>
                                                        <div className="admin-contacts__payment-date">
                                                            {new Date(payment.paymentDate).toLocaleDateString()} •
                                                            {payment.periodMonths} month(s) • {payment.paymentMethod}
                                                        </div>
                                                        {payment.notes && (
                                                            <div className="text-muted small mt-1">
                                                                {payment.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge bg="info">
                                                        ${(payment.amount / payment.periodMonths).toFixed(2)}/month
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="admin-contacts__payment-total mt-3 p-3 bg-dark rounded">
                                            <div className="d-flex justify-content-between">
                                                <strong>Total Paid:</strong>
                                                <strong className="text-success">
                                                    ${payments.reduce((sum, payment) => sum + payment.amount, 0)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted text-center py-3">
                                        No payments recorded yet
                                    </div>
                                )}
                            </div>

                            <div className="admin-contacts__detail-section">
                                <h6 className="admin-contacts__detail-section-title">Message</h6>
                                <div className="admin-contacts__message-content">
                                    {selectedContact.message}
                                </div>
                            </div>

                            {selectedContact.notes && (
                                <div className="admin-contacts__detail-section">
                                    <h6 className="admin-contacts__detail-section-title">Admin Notes</h6>
                                    <div className="admin-contacts__notes-content">
                                        {selectedContact.notes}
                                    </div>
                                </div>
                            )}

                            <div className="admin-contacts__detail-section">
                                <h6 className="admin-contacts__detail-section-title">Add Note</h6>
                                <Form.Group className="admin-contacts__form-group">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add internal notes about this contact..."
                                        onBlur={(e) => addNote(selectedContact._id, e.target.value)}
                                        defaultValue={selectedContact.notes || ''}
                                        className="admin-contacts__notes-textarea"
                                    />
                                </Form.Group>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="admin-contacts__modal-footer">
                            <Button
                                variant="outline-secondary"
                                onClick={handleCloseModal}
                                className="admin-contacts__modal-close-btn"
                            >
                                Close
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => deleteContact(selectedContact._id)}
                                className="admin-contacts__modal-delete-btn"
                            >
                                Delete Contact
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                className="admin-contacts__modal"
            >
                <Modal.Header closeButton className="admin-contacts__modal-header">
                    <Modal.Title className="admin-contacts__modal-title">
                        Add Payment for {selectedContact?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="admin-contacts__modal-body">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Payment Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    amount: parseFloat(e.target.value) || ''
                                }))}
                                placeholder="Enter payment amount"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select
                                value={paymentData.paymentMethod}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    paymentMethod: e.target.value
                                }))}
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Credit Card</option>
                                <option value="cash">Cash</option>
                                <option value="other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Months to Extend (optional)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={paymentData.periodMonths}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    periodMonths: parseInt(e.target.value) || ''
                                }))}
                                placeholder="Auto-calculated from amount"
                            />
                            <Form.Text className="text-muted">
                                Leave empty to auto-calculate based on monthly price
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Payment notes..."
                            />
                        </Form.Group>
                    </Form>

                    {selectedContact?.monthlyPrice && paymentData.amount && (
                        <div className="alert alert-info">
                            <strong>Calculation:</strong> ${paymentData.amount} / ${selectedContact.monthlyPrice} =
                            {Math.floor(paymentData.amount / selectedContact.monthlyPrice)} month(s)
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="admin-contacts__modal-footer">
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddPayment}>
                        Add Payment
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminContacts;