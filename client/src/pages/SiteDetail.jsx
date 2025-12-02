import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { siteAPI, contactAPI } from '../services/api';
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
        startLoading();

        try {
            const contactData = {
                name: contactForm.name.trim(),
                email: contactForm.email.trim(),
                phone: contactForm.phone.trim() || 'Not provided',
                company: contactForm.company.trim() || '',
                message: contactForm.message.trim(),
                siteId: id,
                siteTitle: site.title,
                subject: `Rental Inquiry: ${site.title}`
            };

            console.log('📤 Sending contact data:', contactData);

            const response = await contactAPI.create(contactData);

            if (response.data.success) {
                toast.success('🎉 Your rental request has been sent! We will contact you within 24 hours.');
                setShowContactModal(false);
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    message: `I'm interested in renting "${site.title}" and would like to know more about the rental process, pricing details, and setup requirements.`
                });
            }
        } catch (error) {
            console.error('❌ Error submitting contact form:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Failed to send request. Please try again.';

            toast.error(errorMessage);
        } finally {
            stopLoading();
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

    if (loading && !site) {
        return (
            <div className="site-detail-loading">
                <Container>
                    <div className="site-detail-loading-spinner">
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
                <nav className="site-detail-breadcrumb-nav">
                    <Link to="/" className="site-detail-breadcrumb-link">Home</Link>
                    <span className="site-detail-breadcrumb-separator">/</span>
                    <Link to="/catalog" className="site-detail-breadcrumb-link">Catalog</Link>
                    <span className="site-detail-breadcrumb-separator">/</span>
                    <span className="site-detail-breadcrumb-current">{site.title}</span>
                </nav>

                <Row className="site-detail-content">
                    {/* Gallery Section */}
                    <Col lg={7}>
                        <div className="site-detail-gallery-section">
                            <div className="site-detail-main-gallery">
                                <div className="site-detail-main-image-container">
                                    {site.images && site.images.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${site.images[selectedImage]}`}
                                            alt={site.title}
                                            className="site-detail-gallery-main-img"
                                        />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            <span>🌐</span>
                                            <p>No preview available</p>
                                        </div>
                                    )}
                                    {site.isFeatured && (
                                        <Badge className="site-detail-featured-badge-large">⭐ Featured Website</Badge>
                                    )}
                                </div>

                                {/* Image Navigation */}
                                {site.images && site.images.length > 1 && (
                                    <div className="site-detail-image-navigation">
                                        <Button
                                            variant="outline-light"
                                            className="site-detail-nav-btn prev-btn"
                                            onClick={() => setSelectedImage(prev =>
                                                prev === 0 ? site.images.length - 1 : prev - 1
                                            )}
                                        >
                                            ‹
                                        </Button>
                                        <span className="site-detail-image-counter">
                                            {selectedImage + 1} / {site.images.length}
                                        </span>
                                        <Button
                                            variant="outline-light"
                                            className="site-detail-nav-btn next-btn"
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
                                    <div className="site-detail-thumbnail-gallery">
                                        {site.images.map((image, index) => (
                                            <button
                                                key={index}
                                                className={`site-detail-thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
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
                        <div className="site-detail-info-section">
                            <div className="site-header">
                                <div className="site-detail-meta-badges">
                                    <Badge bg="primary" className="site-detail-category-badge">
                                        {site.category}
                                    </Badge>
                                    {site.isActive && (
                                        <Badge bg="success" className="site-detail-status-badge">
                                            ✅ Available for Rent
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="site-detail-title">{site.title}</h1>

                                <div className="site-detail-price-section">
                                    <div className="site-detail-price-amount">${site.price}</div>
                                    <div className="site-detail-price-period">/month</div>
                                </div>

                                <p className="site-detail-description">{site.description}</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="site-detail-quick-actions">
                                <Button
                                    className="site-detail-btn-rent-now-main"
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
                                <div className="site-detail-key-features">
                                    <h4>🚀 Key Features</h4>
                                    <div className="site-detail-features-grid">
                                        {site.features.map((feature, index) => (
                                            <div key={index} className="site-detail-feature-item">
                                                <span className="site-detail-feature-icon">✓</span>
                                                <span className="site-detail-feature-text">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technologies */}
                            {site.technologies && site.technologies.length > 0 && (
                                <div className="site-detail-technologies-section">
                                    <h4>🛠️ Built With</h4>
                                    <div className="site-detail-tech-tags">
                                        {site.technologies.map((tech, index) => (
                                            <Badge key={index} bg="outline-info" className="site-detail-tech-tag">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Demo Link */}
                            {site.demoUrl && (
                                <div className="site-detail-demo-section">
                                    <h4>🌐 Live Demo</h4>
                                    <a
                                        href={site.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="site-detail-demo-link-btn"
                                    >
                                        Visit Live Website ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Rent Section */}
                <section id="rent-section" className="site-detail-rent-section">
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <div className="site-detail-rent-card">
                                <h2>Ready to Rent This Website?</h2>
                                <p className="site-detail-rent-description">
                                    Get started with this premium website today. Complete the form below
                                    and our team will contact you to discuss the rental process.
                                </p>

                                <div className="site-detail-rent-benefits">
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">⚡</span>
                                        <div>
                                            <h5>Instant Setup</h5>
                                            <p>Get your website live within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">🔧</span>
                                        <div>
                                            <h5>Full Support</h5>
                                            <p>Technical support and maintenance included</p>
                                        </div>
                                    </div>
                                    <div className="site-detail-benefit-item">
                                        <span className="site-detail-benefit-icon">🔄</span>
                                        <div>
                                            <h5>Flexible Terms</h5>
                                            <p>Monthly rental with option to cancel anytime</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="site-detail-btn-rent-now-large"
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
                className="site-detail-contact-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Rent {site.title}</Modal.Title>
                    <div className="site-detail-modal-subtitle">
                        ${site.price}/month • {site.category}
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="site-detail-rental-summary">
                        <div className="site-detail-summary-item">
                            <span>Website:</span>
                            <strong>{site.title}</strong>
                        </div>
                        <div className="site-detail-summary-item">
                            <span>Monthly Price:</span>
                            <strong>${site.price}</strong>
                        </div>
                        <div className="site-detail-summary-item">
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
                                        disabled={loading}
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
                                        disabled={loading}
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
                                        disabled={loading}
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
                                        disabled={loading}
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
                                disabled={loading}
                            />
                        </Form.Group>

                        <div className="site-detail-modal-actions">
                            <Button
                                variant="outline"
                                onClick={() => setShowContactModal(false)}
                                className="me-2"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="site-detail-btn-submit-request"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Sending...
                                    </>
                                ) : (
                                    '📧 Send Rental Request'
                                )}
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
        <section className="site-detail-related-sites-section">
            <h2 className="site-detail-section-title">Similar Websites You Might Like</h2>
            <Row>
                {relatedSites.map((site, index) => (
                    <Col lg={4} key={site._id}>
                        <div className="site-detail-related-site-card">
                            <div className="site-detail-related-site-image">
                                {site.images && site.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${site.images[0]}`}
                                        alt={site.title}
                                    />
                                ) : (
                                    <div className="no-image">🌐</div>
                                )}
                                {site.isFeatured && (
                                    <Badge className="site-detail-related-featured-badge">Featured</Badge>
                                )}
                            </div>
                            <div className="site-detail-related-site-info">
                                <h4>{site.title}</h4>
                                <p className="site-detail-related-site-description">{site.shortDescription}</p>
                                <div className="site-detail-related-site-price">${site.price}/month</div>
                                <Button
                                    as={Link}
                                    to={`/catalog/${site._id}`}
                                    size="sm"
                                    variant="outline"
                                    className="site-detail-btn-view-related"
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