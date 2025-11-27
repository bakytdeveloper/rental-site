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
        priority: 'all',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const { loading, startLoading, stopLoading } = useLoading();

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
                ...(filters.priority !== 'all' && { priority: filters.priority }),
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
    };

    const updateContactStatus = async (contactId, newStatus) => {
        try {
            await contactAPI.update(contactId, { status: newStatus });
            toast.success(`Contact marked as ${newStatus}`);
            fetchContacts();
            if (selectedContact?._id === contactId) {
                setSelectedContact(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Не удалось обновить статус контакта.');
            console.error('Error updating contact status:', error);
        }
    };

    const updateContactPriority = async (contactId, newPriority) => {
        try {
            await contactAPI.update(contactId, { priority: newPriority });
            toast.success(`Priority updated to ${newPriority}`);
            fetchContacts();
            if (selectedContact?._id === contactId) {
                setSelectedContact(prev => ({ ...prev, priority: newPriority }));
            }
        } catch (error) {
            toast.error('Не удалось обновить приоритет контакта.');
            console.error('Error updating contact priority:', error);
        }
    };

    const addNote = async (contactId, note) => {
        try {
            await contactAPI.update(contactId, { notes: note });
            toast.success('Note added successfully');
            fetchContacts();
            if (selectedContact?._id === contactId) {
                setSelectedContact(prev => ({ ...prev, notes: note }));
            }
        } catch (error) {
            toast.error('Не удалось добавить заметку');
            console.error('Error adding note:', error);
        }
    };

    const deleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await contactAPI.delete(contactId);
                toast.success('Contact deleted successfully');
                fetchContacts();
                if (selectedContact?._id === contactId) {
                    handleCloseModal();
                }
            } catch (error) {
                toast.error('Не удалось удалить контакт.');
                console.error('Error deleting contact:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            new: 'danger',
            contacted: 'warning',
            completed: 'success',
            spam: 'secondary'
        };
        return <Badge bg={variants[status]}>{status}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const variants = {
            high: 'danger',
            medium: 'warning',
            low: 'secondary'
        };
        return <Badge bg={variants[priority]}>{priority}</Badge>;
    };

    if (loading && contacts.length === 0) {
        return (
            <div className="admin-loading">
                <Spinner animation="border" variant="primary" />
                <p>Loading contacts...</p>
            </div>
        );
    }

    return (
        <div className="admin-contacts">
            <div className="page-header">
                <h1>Contact Management</h1>
                <div className="contact-stats">
                    <Badge bg="outline-info" className="stat-badge">
                        Total: {pagination.total}
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <Card className="filters-card">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="completed">Completed</option>
                                    <option value="spam">Spam</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Priority</Form.Label>
                                <Form.Select
                                    value={filters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                >
                                    <option value="all">All Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name, email, or message..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Contacts Table */}
            <Card className="contacts-table-card">
                <Card.Body>
                    {filteredContacts.length > 0 ? (
                        <>
                            <Table responsive className="contacts-table">
                                <thead>
                                <tr>
                                    <th>Contact Info</th>
                                    <th>Website</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredContacts.map(contact => (
                                    <tr key={contact._id}>
                                        <td>
                                            <div className="contact-info">
                                                <div className="contact-name">{contact.name}</div>
                                                <div className="contact-email">{contact.email}</div>
                                                {contact.phone && (
                                                    <div className="contact-phone">{contact.phone}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {contact.siteTitle ? (
                                                <div className="site-info">
                                                    <Badge bg="outline-primary" className="site-badge">
                                                        {contact.siteTitle}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-muted">General Inquiry</span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(contact.status)}</td>
                                        <td>{getPriorityBadge(contact.priority)}</td>
                                        <td>
                                            <div className="date-info">
                                                <div>{new Date(contact.createdAt).toLocaleDateString()}</div>
                                                <small className="text-muted">
                                                    {new Date(contact.createdAt).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleViewDetails(contact)}
                                                    className="me-1"
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => deleteContact(contact._id)}
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
                                <div className="pagination-container">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-data">
                            <p>No contacts found matching your criteria.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Contact Detail Modal */}
            <Modal show={showDetailModal} onHide={handleCloseModal} size="lg" className="contact-detail-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Contact Details</Modal.Title>
                </Modal.Header>
                {selectedContact && (
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <div className="detail-section">
                                    <h6>Personal Information</h6>
                                    <div className="detail-item">
                                        <strong>Name:</strong> {selectedContact.name}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Email:</strong> {selectedContact.email}
                                    </div>
                                    {selectedContact.phone && (
                                        <div className="detail-item">
                                            <strong>Phone:</strong> {selectedContact.phone}
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="detail-section">
                                    <h6>Request Information</h6>
                                    <div className="detail-item">
                                        <strong>Status:</strong>
                                        <div className="status-actions">
                                            {getStatusBadge(selectedContact.status)}
                                            <div className="btn-group-sm ms-2">
                                                {['new', 'contacted', 'completed', 'spam'].map(status => (
                                                    <Button
                                                        key={status}
                                                        size="sm"
                                                        variant={selectedContact.status === status ? 'primary' : 'outline-primary'}
                                                        onClick={() => updateContactStatus(selectedContact._id, status)}
                                                    >
                                                        {status}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Priority:</strong>
                                        <div className="priority-actions">
                                            {getPriorityBadge(selectedContact.priority)}
                                            <div className="btn-group-sm ms-2">
                                                {['low', 'medium', 'high'].map(priority => (
                                                    <Button
                                                        key={priority}
                                                        size="sm"
                                                        variant={selectedContact.priority === priority ? 'primary' : 'outline-primary'}
                                                        onClick={() => updateContactPriority(selectedContact._id, priority)}
                                                    >
                                                        {priority}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedContact.siteTitle && (
                                        <div className="detail-item">
                                            <strong>Website:</strong> {selectedContact.siteTitle}
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <strong>Submitted:</strong> {new Date(selectedContact.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="detail-section">
                            <h6>Message</h6>
                            <div className="message-content">
                                {selectedContact.message}
                            </div>
                        </div>

                        {selectedContact.notes && (
                            <div className="detail-section">
                                <h6>Admin Notes</h6>
                                <div className="notes-content">
                                    {selectedContact.notes}
                                </div>
                            </div>
                        )}

                        <div className="detail-section">
                            <h6>Add Note</h6>
                            <Form.Group>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Add internal notes about this contact..."
                                    onBlur={(e) => addNote(selectedContact._id, e.target.value)}
                                    defaultValue={selectedContact.notes || ''}
                                />
                            </Form.Group>
                        </div>
                    </Modal.Body>
                )}
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => deleteContact(selectedContact._id)}
                    >
                        Delete Contact
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminContacts;