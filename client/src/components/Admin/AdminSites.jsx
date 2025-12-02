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
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);

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
            console.log('Editing site:', site);
            console.log('Site images:', site.images);
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
            if (site.images && site.images.length > 0) {
                const previews = site.images.map(img => `http://localhost:5000${img}`);
                console.log('Setting image previews:', previews);
                setImagePreviews(previews);
            } else {
                console.log('No images for site');
                setImagePreviews([]);
            }
        } else {
            console.log('Creating new site');
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
        imagePreviews.forEach(preview => {
            if (!preview.startsWith('http://localhost:5000/uploads/')) {
                URL.revokeObjectURL(preview);
            }
        });

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

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imagePreviews.length + files.length;

        if (totalImages > 7) {
            toast.error(`Maximum 7 images allowed. You have ${imagePreviews.length} images and trying to add ${files.length} more.`);
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeImage = async (index) => {
        console.log('Removing image at index:', index);
        console.log('Current imagePreviews:', imagePreviews);

        const imageToRemove = imagePreviews[index];
        const isServerImage = imageToRemove.startsWith('http://localhost:5000/uploads/');

        if (isServerImage && editingSite) {
            if (window.confirm('Are you sure you want to remove this image?')) {
                const newPreviews = imagePreviews.filter((_, i) => i !== index);
                setImagePreviews(newPreviews);
                console.log('Removed server image from previews');
            }
            return;
        }

        const newPreviews = [...imagePreviews];
        const newSelectedImages = [...selectedImages];
        const selectedImagesIndex = index - (imagePreviews.length - selectedImages.length);

        newPreviews.splice(index, 1);

        if (selectedImagesIndex >= 0 && selectedImagesIndex < selectedImages.length) {
            URL.revokeObjectURL(imageToRemove);
            newSelectedImages.splice(selectedImagesIndex, 1);
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
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'technologies' || key === 'features') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            if (editingSite) {
                const remainingServerImages = imagePreviews
                    .filter(preview => preview.startsWith('http://localhost:5000/uploads/'))
                    .map(preview => preview.replace('http://localhost:5000', ''));

                console.log('Remaining server images:', remainingServerImages);
                submitData.append('existingImages', JSON.stringify(remainingServerImages));
            }

            selectedImages.forEach((image, index) => {
                submitData.append('images', image);
            });

            console.log('Submitting data:');
            console.log('Selected images count:', selectedImages.length);
            console.log('Editing site:', editingSite);

            if (editingSite) {
                console.log('Updating site with ID:', editingSite._id);
                const response = await siteAPI.update(editingSite._id, submitData);
                console.log('Update response:', response.data);
                toast.success('Site updated successfully');
            } else {
                console.log('Creating new site');
                const response = await siteAPI.create(submitData);
                console.log('Create response:', response.data);
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

    const getSiteImage = (site) => {
        if (site.images && site.images.length > 0) {
            return `http://localhost:5000${site.images[0]}`;
        }
        return '/placeholder-image.jpg';
    };

    if (loading && sites.length === 0) {
        return (
            <div className="admin-sites-loading">
                <Spinner animation="border" variant="primary" />
                <p>Loading websites...</p>
            </div>
        );
    }

    return (
        <div className="admin-sites">
            <div className="admin-sites-page-header">
                <h1>Website Management</h1>
                <Button onClick={() => handleShowModal()} className="admin-sites-btn-add-site">
                    + Add New Website
                </Button>
            </div>

            <Card className="admin-sites-table-card">
                <Card.Body className="p-0">
                    {sites.length > 0 ? (
                        <div className="admin-sites-table-container">
                        <div className="table-responsive">
                            <Table className="admin-sites-table">
                                <thead>
                                <tr>
                                    <th className="admin-sites-image-cell">Image</th>
                                    <th className="admin-sites-title-cell">Website</th>
                                    <th className="admin-sites-category-cell">Category</th>
                                    <th className="admin-sites-price-cell">Price</th>
                                    <th className="admin-sites-status-cell">Status</th>
                                    <th className="admin-sites-featured-cell">Featured</th>
                                    <th className="admin-sites-technologies-cell">Technologies</th>
                                    <th className="admin-sites-actions-cell">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sites.map(site => (
                                    <tr key={site._id} className="admin-sites-site-row">
                                        <td className="admin-sites-image-cell">
                                            <div className="admin-sites-image-container">
                                                <img
                                                    src={getSiteImage(site)}
                                                    alt={site.title}
                                                    className="admin-sites-thumbnail"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                {site.isFeatured && (
                                                    <div className="admin-sites-featured-indicator" title="Featured">
                                                        ⭐
                                                    </div>
                                                )}
                                                {site.images && site.images.length > 1 && (
                                                    <div className="admin-sites-image-count-badge" title={`${site.images.length} images`}>
                                                        +{site.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-sites-title-cell">
                                            <div className="admin-sites-info">
                                                <div className="admin-sites-title">{site.title}</div>
                                                <div className="admin-sites-short-description">
                                                    {site.shortDescription}
                                                </div>
                                                <div className="admin-sites-meta">
                                                    <span className="admin-sites-created-date">
                                                        Created: {new Date(site.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-sites-category-cell">
                                            <Badge bg="outline-primary" className="admin-sites-category-badge">
                                                {site.category}
                                            </Badge>
                                        </td>
                                        <td className="admin-sites-price-cell">
                                            <div className="admin-sites-price-amount">${site.price}</div>
                                            <div className="admin-sites-price-period">/month</div>
                                        </td>
                                        <td className="admin-sites-status-cell">
                                            <Badge
                                                bg={site.isActive ? 'success' : 'secondary'}
                                                className="admin-sites-status-badge"
                                                role="button"
                                                onClick={() => toggleSiteStatus(site._id, site.isActive)}
                                            >
                                                {site.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="admin-sites-featured-cell">
                                            <Badge
                                                bg={site.isFeatured ? 'warning' : 'outline-warning'}
                                                className="admin-sites-featured-badge"
                                                role="button"
                                                onClick={() => toggleFeatured(site._id, site.isFeatured)}
                                            >
                                                {site.isFeatured ? 'Featured' : 'Standard'}
                                            </Badge>
                                        </td>
                                        <td className="admin-sites-technologies-cell">
                                            <div className="admin-sites-tech-tags">
                                                {site.technologies?.slice(0, 3).map((tech, index) => (
                                                    <Badge key={index} bg="outline-info" className="admin-sites-tech-tag">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {site.technologies?.length > 3 && (
                                                    <Badge bg="outline-secondary" className="admin-sites-tech-tag-more">
                                                        +{site.technologies.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-sites-actions-cell">
                                            <div className="admin-sites-action-buttons">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleShowModal(site)}
                                                    className="admin-sites-btn-edit"
                                                    title="Edit site"
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => handleDelete(site._id)}
                                                    className="admin-sites-btn-delete"
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
                        </div>
                    ) : (
                        <div className="admin-sites-no-data">
                            <div className="admin-sites-no-data-icon">🌐</div>
                            <p>No websites found. Create your first website to get started.</p>
                            <Button onClick={() => handleShowModal()} className="admin-sites-btn-add-first">
                                Add First Website
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" className="admin-sites-modal">
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

                        {/* Image Upload Section */}
                        <Form.Group className="mb-4">
                            <Form.Label>Website Images *</Form.Label>
                            <Form.Text className="text-muted d-block mb-2">
                                Upload screenshots of your website. First image will be used as main preview. Maximum 7 images.
                            </Form.Text>

                            {editingSite && (
                                <div className="admin-sites-debug-info mb-2">
                                    <small className="text-info">
                                        Debug: {imagePreviews.length} total previews ({imagePreviews.filter(p => p.startsWith('http://localhost:5000/uploads/')).length} server, {selectedImages.length} new)
                                    </small>
                                </div>
                            )}

                            {imagePreviews.length > 0 && (
                                <div className="admin-sites-image-previews mb-3">
                                    <Row>
                                        {imagePreviews.map((preview, index) => {
                                            const isServerImage = preview.startsWith('http://localhost:5000/uploads/');
                                            return (
                                                <Col key={index} xs={6} md={4} className="mb-3">
                                                    <div className="admin-sites-image-preview-container">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="admin-sites-image-preview"
                                                        />
                                                        <div className="admin-sites-image-info">
                                                            <small className={isServerImage ? 'text-success' : 'text-warning'}>
                                                                {isServerImage ? 'Server' : 'New'}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="admin-sites-remove-image-btn"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </div>
                            )}

                            <div className="admin-sites-image-upload-area">
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
                                    disabled={imagePreviews.length >= 7}
                                >
                                    📷 Choose Images ({imagePreviews.length}/7)
                                    {imagePreviews.length >= 7 && (
                                        <span className="ms-1 text-warning">• Limit reached</span>
                                    )}
                                </Button>
                                <Form.Text className="text-muted">
                                    Supported formats: JPG, PNG, WebP. Max 5MB per image. Maximum 7 images total.
                                </Form.Text>
                            </div>

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
                            <div className="admin-sites-tags-container">
                                {formData.technologies.map((tech, index) => (
                                    <Badge key={index} bg="primary" className="admin-sites-tag">
                                        {tech}
                                        <span className="admin-sites-tag-remove" onClick={() => removeTechnology(tech)}>
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
                            <div className="admin-sites-tags-container">
                                {formData.features.map((feature, index) => (
                                    <Badge key={index} bg="success" className="admin-sites-tag">
                                        {feature}
                                        <span className="admin-sites-tag-remove" onClick={() => removeFeature(feature)}>
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
                            disabled={loading || (imagePreviews.length === 0 && !editingSite) || imagePreviews.length > 7}
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