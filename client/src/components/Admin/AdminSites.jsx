import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { siteAPI } from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import './AdminSites.css';

const AdminSites = () => {
    const [sites, setSites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]); // Новое состояние для изображений
    const [imagePreviews, setImagePreviews] = useState([]); // Превью изображений
    const fileInputRef = useRef(null); // Ref для input файлов

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
            // Используем админский метод для получения всех сайтов
            const response = await siteAPI.getAllAdmin();
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
            // Устанавливаем превью существующих изображений
            if (site.images && site.images.length > 0) {
                setImagePreviews(site.images.map(img => `http://localhost:5000${img}`));
            } else {
                setImagePreviews([]);
            }
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
            setImagePreviews([]);
        }
        setSelectedImages([]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSite(null);
        setTechInput('');
        setFeatureInput('');
        setSelectedImages([]);
        setImagePreviews([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Обработчик выбора файлов
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);

        // Создаем превью для выбранных файлов
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    // Удаление изображения из превью
    const removeImage = (index) => {
        const newPreviews = [...imagePreviews];
        const newSelectedImages = [...selectedImages];

        newPreviews.splice(index, 1);
        // Если это новое изображение (не с сервера), удаляем из selectedImages
        if (index < selectedImages.length) {
            newSelectedImages.splice(index, 1);
            setSelectedImages(newSelectedImages);
        }

        setImagePreviews(newPreviews);
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
            // Создаем FormData для отправки файлов
            const submitData = new FormData();

            // Добавляем текстовые поля
            Object.keys(formData).forEach(key => {
                if (key === 'technologies' || key === 'features') {
                    // Массивы преобразуем в JSON строки
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            // Добавляем изображения
            selectedImages.forEach((image, index) => {
                submitData.append('images', image);
            });

            // Отладочная информация
            console.log('Submitting data:');
            for (let [key, value] of submitData.entries()) {
                console.log(key, value);
            }

            if (editingSite) {
                await siteAPI.update(editingSite._id, submitData);
                toast.success('Site updated successfully');
            } else {
                await siteAPI.create(submitData);
                toast.success('Site created successfully');
            }

            handleCloseModal();
            fetchSites();
        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error response:', error.response?.data);
            toast.error(`Failed to ${editingSite ? 'update' : 'create'} site: ${error.response?.data?.message || error.message}`);
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

    // Функция для получения первого изображения сайта
    const getSiteImage = (site) => {
        if (site.images && site.images.length > 0) {
            return `http://localhost:5000${site.images[0]}`;
        }
        return '/placeholder-image.jpg'; // Запасное изображение
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
                <Card.Body className="p-0">
                    {sites.length > 0 ? (
                        <div className="table-responsive">
                            <Table className="sites-table">
                                <thead>
                                <tr>
                                    <th className="image-column">Image</th>
                                    <th className="title-column">Website</th>
                                    <th className="category-column">Category</th>
                                    <th className="price-column">Price</th>
                                    <th className="status-column">Status</th>
                                    <th className="featured-column">Featured</th>
                                    <th className="technologies-column">Technologies</th>
                                    <th className="actions-column">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sites.map(site => (
                                    <tr key={site._id} className="site-row">
                                        <td className="image-cell">
                                            <div className="site-image-container">
                                                <img
                                                    src={getSiteImage(site)}
                                                    alt={site.title}
                                                    className="site-thumbnail"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                {site.isFeatured && (
                                                    <div className="featured-indicator" title="Featured">
                                                        ⭐
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="title-cell">
                                            <div className="site-info">
                                                <div className="site-title">{site.title}</div>
                                                <div className="site-short-description">
                                                    {site.shortDescription}
                                                </div>
                                                <div className="site-meta">
                                                    <span className="created-date">
                                                        Created: {new Date(site.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="category-cell">
                                            <Badge bg="outline-primary" className="category-badge">
                                                {site.category}
                                            </Badge>
                                        </td>
                                        <td className="price-cell">
                                            <div className="price-amount">${site.price}</div>
                                            <div className="price-period">/month</div>
                                        </td>
                                        <td className="status-cell">
                                            <Badge
                                                bg={site.isActive ? 'success' : 'secondary'}
                                                className="status-badge"
                                                role="button"
                                                onClick={() => toggleSiteStatus(site._id, site.isActive)}
                                            >
                                                {site.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="featured-cell">
                                            <Badge
                                                bg={site.isFeatured ? 'warning' : 'outline-warning'}
                                                className="featured-badge"
                                                role="button"
                                                onClick={() => toggleFeatured(site._id, site.isFeatured)}
                                            >
                                                {site.isFeatured ? 'Featured' : 'Standard'}
                                            </Badge>
                                        </td>
                                        <td className="technologies-cell">
                                            <div className="tech-tags">
                                                {site.technologies?.slice(0, 3).map((tech, index) => (
                                                    <Badge key={index} bg="outline-info" className="tech-tag">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {site.technologies?.length > 3 && (
                                                    <Badge bg="outline-secondary" className="tech-tag-more">
                                                        +{site.technologies.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleShowModal(site)}
                                                    className="btn-edit"
                                                    title="Edit site"
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => handleDelete(site._id)}
                                                    className="btn-delete"
                                                    title="Delete site"
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="no-data">
                            <div className="no-data-icon">🌐</div>
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

                        {/* Поле для загрузки изображений */}
                        <Form.Group className="mb-4">
                            <Form.Label>Website Images *</Form.Label>
                            <Form.Text className="text-muted d-block mb-2">
                                Upload screenshots of your website. First image will be used as main preview.
                            </Form.Text>

                            {/* Превью изображений */}
                            {imagePreviews.length > 0 && (
                                <div className="image-previews mb-3">
                                    <Row>
                                        {imagePreviews.map((preview, index) => (
                                            <Col key={index} xs={6} md={4} className="mb-3">
                                                <div className="image-preview-container">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="image-preview"
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="remove-image-btn"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Input для выбора файлов */}
                            <div className="image-upload-area">
                                <Form.Control
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    ref={fileInputRef}
                                    className="d-none"
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-100"
                                >
                                    📷 Choose Images
                                </Button>
                                <Form.Text className="text-muted">
                                    Supported formats: JPG, PNG, WebP. Max 5MB per image.
                                </Form.Text>
                            </div>

                            {/* Валидация */}
                            {selectedImages.length === 0 && !editingSite && (
                                <Form.Text className="text-danger">
                                    At least one image is required
                                </Form.Text>
                            )}
                        </Form.Group>

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
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || (selectedImages.length === 0 && !editingSite)}
                        >
                            {loading ? 'Saving...' : (editingSite ? 'Update' : 'Create')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSites;