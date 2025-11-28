import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { siteAPI } from '../services/api';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import './SiteDetail.css';

const SiteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [site, setSite] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: `I'm interested in renting this website and would like to know more about the rental process, pricing details, and setup requirements.`
    });
    const { loading, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        if (id) {
            fetchSiteDetail();
        }
    }, [id]);

    const fetchSiteDetail = async () => {
        startLoading();
        try {
            const response = await siteAPI.getById(id);
            setSite(response.data);
            // Set default message with site title
            setContactForm(prev => ({
                ...prev,
                message: `I'm interested in renting "${response.data.title}" and would like to know more about the rental process, pricing details, and setup requirements.`
            }));
        } catch (error) {
            console.error('Error fetching site details:', error);
            toast.error('Failed to load site details');
            navigate('/catalog');
        } finally {
            stopLoading();
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            // Здесь будет API call для отправки формы
            console.log('Contact form submitted:', { ...contactForm, siteId: id, siteTitle: site.title });
            toast.success('🎉 Your rental request has been sent! We will contact you within 24 hours.');
            setShowContactModal(false);
            setContactForm({
                name: '',
                email: '',
                phone: '',
                company: '',
                message: `I'm interested in renting "${site.title}" and would like to know more about the rental process, pricing details, and setup requirements.`
            });
        } catch (error) {
            toast.error('Failed to send request. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const scrollToRent = () => {
        const element = document.getElementById('rent-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="site-detail-loading">
                <Container>
                    <div className="loading-spinner">
                        <Spinner animation="border" variant="primary" />
                        <p>Loading website details...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!site) {
        return (
            <Container>
                <Alert variant="danger" className="mt-4">
                    <h4>Website Not Found</h4>
                    <p>The website you're looking for doesn't exist or has been removed.</p>
                    <Button as={Link} to="/catalog" variant="primary">
                        Back to Catalog
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="site-detail-page">
            <Container>
                {/* Breadcrumb */}
                <nav className="breadcrumb-nav">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/catalog" className="breadcrumb-link">Catalog</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{site.title}</span>
                </nav>

                <Row className="site-detail-content">
                    {/* Gallery Section */}
                    <Col lg={7}>
                        <div className="gallery-section">
                            <div className="main-gallery">
                                <div className="main-image-container">
                                    {site.images && site.images.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${site.images[selectedImage]}`}
                                            alt={site.title}
                                            className="gallery-main-img"
                                        />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            <span>🌐</span>
                                            <p>No preview available</p>
                                        </div>
                                    )}
                                    {site.isFeatured && (
                                        <Badge className="featured-badge-large">⭐ Featured Website</Badge>
                                    )}
                                </div>

                                {/* Image Navigation */}
                                {site.images && site.images.length > 1 && (
                                    <div className="image-navigation">
                                        <Button
                                            variant="outline-light"
                                            className="nav-btn prev-btn"
                                            onClick={() => setSelectedImage(prev =>
                                                prev === 0 ? site.images.length - 1 : prev - 1
                                            )}
                                        >
                                            ‹
                                        </Button>
                                        <span className="image-counter">
                                            {selectedImage + 1} / {site.images.length}
                                        </span>
                                        <Button
                                            variant="outline-light"
                                            className="nav-btn next-btn"
                                            onClick={() => setSelectedImage(prev =>
                                                prev === site.images.length - 1 ? 0 : prev + 1
                                            )}
                                        >
                                            ›
                                        </Button>
                                    </div>
                                )}

                                {/* Thumbnail Gallery */}
                                {site.images && site.images.length > 1 && (
                                    <div className="thumbnail-gallery">
                                        {site.images.map((image, index) => (
                                            <button
                                                key={index}
                                                className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                                                onClick={() => setSelectedImage(index)}
                                            >
                                                <img
                                                    src={`http://localhost:5000${image}`}
                                                    alt={`${site.title} view ${index + 1}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Site Info Section */}
                    <Col lg={5}>
                        <div className="site-info-section">
                            <div className="site-header">
                                <div className="site-meta-badges">
                                    <Badge bg="primary" className="category-badge">
                                        {site.category}
                                    </Badge>
                                    {site.isActive && (
                                        <Badge bg="success" className="status-badge">
                                            ✅ Available for Rent
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="site-title">{site.title}</h1>

                                <div className="price-section">
                                    <div className="price-amount">${site.price}</div>
                                    <div className="price-period">/month</div>
                                </div>

                                <p className="site-description">{site.description}</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <Button
                                    className="btn-rent-now-main"
                                    size="lg"
                                    onClick={scrollToRent}
                                >
                                    💳 Rent This Website
                                </Button>
                                <Button
                                    variant="outline-light"
                                    className="btn-rent-now"
                                    size="lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    💬 Quick Inquiry
                                </Button>
                            </div>

                            {/* Key Features */}
                            {site.features && site.features.length > 0 && (
                                <div className="key-features">
                                    <h4>🚀 Key Features</h4>
                                    <div className="features-grid">
                                        {site.features.map((feature, index) => (
                                            <div key={index} className="feature-item">
                                                <span className="feature-icon">✓</span>
                                                <span className="feature-text">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technologies */}
                            {site.technologies && site.technologies.length > 0 && (
                                <div className="technologies-section">
                                    <h4>🛠️ Built With</h4>
                                    <div className="tech-tags">
                                        {site.technologies.map((tech, index) => (
                                            <Badge key={index} bg="outline-info" className="tech-tag">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Demo Link */}
                            {site.demoUrl && (
                                <div className="demo-section">
                                    <h4>🌐 Live Demo</h4>
                                    <a
                                        href={site.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="demo-link-btn"
                                    >
                                        Visit Live Website ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Rent Section */}
                <section id="rent-section" className="rent-section">
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <div className="rent-card">
                                <h2>Ready to Rent This Website?</h2>
                                <p className="rent-description">
                                    Get started with this premium website today. Complete the form below
                                    and our team will contact you to discuss the rental process.
                                </p>

                                <div className="rent-benefits">
                                    <div className="benefit-item">
                                        <span className="benefit-icon">⚡</span>
                                        <div>
                                            <h5>Instant Setup</h5>
                                            <p>Get your website live within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">🔧</span>
                                        <div>
                                            <h5>Full Support</h5>
                                            <p>Technical support and maintenance included</p>
                                        </div>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">🔄</span>
                                        <div>
                                            <h5>Flexible Terms</h5>
                                            <p>Monthly rental with option to cancel anytime</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="btn-rent-now-large"
                                    size="lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    Start Renting - ${site.price}/month
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* Related Sites Section */}
                <RelatedSites currentSiteId={site._id} category={site.category} />
            </Container>

            {/* Contact Modal */}
            <Modal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                centered
                size="lg"
                className="contact-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Rent {site.title}</Modal.Title>
                    <div className="modal-subtitle">
                        ${site.price}/month • {site.category}
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="rental-summary">
                        <div className="summary-item">
                            <span>Website:</span>
                            <strong>{site.title}</strong>
                        </div>
                        <div className="summary-item">
                            <span>Monthly Price:</span>
                            <strong>${site.price}</strong>
                        </div>
                        <div className="summary-item">
                            <span>Category:</span>
                            <strong>{site.category}</strong>
                        </div>
                    </div>

                    <Form onSubmit={handleContactSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={contactForm.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Company</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="company"
                                        value={contactForm.company}
                                        onChange={handleInputChange}
                                        placeholder="Your company (optional)"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Your Message *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="message"
                                value={contactForm.message}
                                onChange={handleInputChange}
                                required
                                placeholder="Tell us about your rental needs..."
                            />
                        </Form.Group>

                        <div className="modal-actions">
                            <Button
                                variant="outline"
                                onClick={() => setShowContactModal(false)}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="btn-submit-request">
                                📧 Send Rental Request
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

// Related Sites Component
const RelatedSites = ({ currentSiteId, category }) => {
    const [relatedSites, setRelatedSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelatedSites();
    }, [category, currentSiteId]);

    const fetchRelatedSites = async () => {
        try {
            const response = await siteAPI.getAll({
                category: category,
                limit: 4
            });
            const filtered = response.data.sites.filter(site => site._id !== currentSiteId);
            setRelatedSites(filtered.slice(0, 3));
        } catch (error) {
            console.error('Error fetching related sites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (relatedSites.length === 0) return null;

    return (
        <section className="related-sites-section">
            <h2 className="section-title">Similar Websites You Might Like</h2>
            <Row>
                {relatedSites.map((site, index) => (
                    <Col lg={4} key={site._id}>
                        <div className="related-site-card">
                            <div className="related-site-image">
                                {site.images && site.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${site.images[0]}`}
                                        alt={site.title}
                                    />
                                ) : (
                                    <div className="no-image">🌐</div>
                                )}
                                {site.isFeatured && (
                                    <Badge className="related-featured-badge">Featured</Badge>
                                )}
                            </div>
                            <div className="related-site-info">
                                <h4>{site.title}</h4>
                                <p className="related-site-description">{site.shortDescription}</p>
                                <div className="related-site-price">${site.price}/month</div>
                                <Button
                                    as={Link}
                                    to={`/catalog/${site._id}`}
                                    size="sm"
                                    variant="outline"
                                    className="btn-view-related"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </section>
    );
};

export default SiteDetail;