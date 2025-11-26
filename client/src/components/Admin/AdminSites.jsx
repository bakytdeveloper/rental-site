import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminSites.css';

const AdminSites = () => {
    const [sites, setSites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        price: '',
        category: 'Landing Page',
        technologies: [],
        features: [],
        isFeatured: false,
        isActive: true
    });
    const [techInput, setTechInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        startLoading();
        try {
            const response = await siteAPI.getAll({ limit: 100 });
            setSites(response.data.sites || []);
        } catch (error) {
            toast.error('Failed to fetch sites');
            console.error('Error fetching sites:', error);
        } finally {
            stopLoading();
        }
    };

    const handleShowModal = (site = null) => {
        if (site) {
            setEditingSite(site);
            setFormData({
                title: site.title,
                description: site.description,
                shortDescription: site.shortDescription,
                price: site.price,
                category: site.category,
                technologies: site.technologies || [],
                features: site.features || [],
                isFeatured: site.isFeatured,
                isActive: site.isActive
            });
        } else {
            setEditingSite(null);
            setFormData({
                title: '',
                description: '',
                shortDescription: '',
                price: '',
                category: 'Landing Page',
                technologies: [],
                features: [],
                isFeatured: false,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSite(null);
        setTechInput('');
        setFeatureInput('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const removeTechnology = (tech) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech)
        }));
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        startLoading();

        try {
            if (editingSite) {
                await siteAPI.update(editingSite._id, formData);
                toast.success('Site updated successfully');
            } else {
                await siteAPI.create(formData);
                toast.success('Site created successfully');
            }

            handleCloseModal();
            fetchSites();
        } catch (error) {
            toast.error(`Failed to ${editingSite ? 'update' : 'create'} site`);
            console.error('Error saving site:', error);
        } finally {
            stopLoading();
        }
    };

    const handleDelete = async (siteId) => {
        if (window.confirm('Are you sure you want to delete this site?')) {
            startLoading();
            try {
                await siteAPI.delete(siteId);
                toast.success('Site deleted successfully');
                fetchSites();
            } catch (error) {
                toast.error('Failed to delete site');
                console.error('Error deleting site:', error);
            } finally {
                stopLoading();
            }
        }
    };

    const toggleSiteStatus = async (siteId, currentStatus) => {
        try {
            await siteAPI.update(siteId, { isActive: !currentStatus });
            toast.success(`Site ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchSites();
        } catch (error) {
            toast.error('Failed to update site status');
            console.error('Error updating site status:', error);
        }
    };

    const toggleFeatured = async (siteId, currentFeatured) => {
        try {
            await siteAPI.update(siteId, { isFeatured: !currentFeatured });
            toast.success(`Site ${!currentFeatured ? 'added to' : 'removed from'} featured`);
            fetchSites();
        } catch (error) {
            toast.error('Failed to update featured status');
            console.error('Error updating featured status:', error);
        }
    };

    if (loading && sites.length === 0) {
        return (
            <div className="admin-loading">
                <Spinner animation="border" variant="primary" />
                <p>Loading websites...</p>
            </div>
        );
    }

    return (
        <div className="admin-sites">
            <div className="page-header">
                <h1>Website Management</h1>
                <Button onClick={() => handleShowModal()} className="btn-add-site">
                    + Add New Website
                </Button>
            </div>

            <Card className="sites-table-card">
                <Card.Body>
                    {sites.length > 0 ? (
                        <Table responsive className="sites-table">
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Featured</th>
                                <th>Technologies</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sites.map(site => (
                                <tr key={site._id}>
                                    <td>
                                        <div className="site-info">
                                            <div className="site-title">{site.title}</div>
                                            <div className="site-description">
                                                {site.shortDescription}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="outline-primary" className="category-badge">
                                            {site.category}
                                        </Badge>
                                    </td>
                                    <td className="site-price">${site.price}/mo</td>
                                    <td>
                                        <Badge
                                            bg={site.isActive ? 'success' : 'secondary'}
                                            className="status-badge"
                                            role="button"
                                            onClick={() => toggleSiteStatus(site._id, site.isActive)}
                                        >
                                            {site.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={site.isFeatured ? 'warning' : 'outline-warning'}
                                            className="featured-badge"
                                            role="button"
                                            onClick={() => toggleFeatured(site._id, site.isFeatured)}
                                        >
                                            {site.isFeatured ? 'Featured' : 'Not Featured'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="tech-tags">
                                            {site.technologies?.slice(0, 2).map((tech, index) => (
                                                <Badge key={index} bg="outline-info" className="tech-tag">
                                                    {tech}
                                                </Badge>
                                            ))}
                                            {site.technologies?.length > 2 && (
                                                <Badge bg="outline-secondary" className="tech-tag">
                                                    +{site.technologies.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => handleShowModal(site)}
                                                className="me-1"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDelete(site._id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="no-data">
                            <p>No websites found. Create your first website to get started.</p>
                            <Button onClick={() => handleShowModal()} className="btn-add-first">
                                Add First Website
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" className="site-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingSite ? 'Edit Website' : 'Add New Website'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter website title"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Landing Page">Landing Page</option>
                                        <option value="Corporate Website">Corporate Website</option>
                                        <option value="E-commerce">E-commerce</option>
                                        <option value="Portfolio">Portfolio</option>
                                        <option value="Web Application">Web Application</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Short Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                required
                                placeholder="Brief description (max 200 characters)"
                                maxLength={200}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Full Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                placeholder="Detailed description of the website"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Monthly Price ($) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Technologies */}
                        <Form.Group className="mb-3">
                            <Form.Label>Technologies</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="text"
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    placeholder="Add technology (e.g., React, Node.js)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                />
                                <Button variant="outline-secondary" onClick={addTechnology}>
                                    Add
                                </Button>
                            </div>
                            <div className="tags-container">
                                {formData.technologies.map((tech, index) => (
                                    <Badge key={index} bg="primary" className="tag">
                                        {tech}
                                        <span className="tag-remove" onClick={() => removeTechnology(tech)}>
                      ×
                    </span>
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        {/* Features */}
                        <Form.Group className="mb-3">
                            <Form.Label>Features</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="text"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    placeholder="Add feature (e.g., Responsive Design, SEO Optimized)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button variant="outline-secondary" onClick={addFeature}>
                                    Add
                                </Button>
                            </div>
                            <div className="tags-container">
                                {formData.features.map((feature, index) => (
                                    <Badge key={index} bg="success" className="tag">
                                        {feature}
                                        <span className="tag-remove" onClick={() => removeFeature(feature)}>
                      ×
                    </span>
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox"
                                    name="isFeatured"
                                    label="Featured Website"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="mb-3"
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox"
                                    name="isActive"
                                    label="Active"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="mb-3"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (editingSite ? 'Update' : 'Create')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSites;