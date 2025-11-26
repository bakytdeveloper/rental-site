import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
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
        message: ''
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
            console.log('Contact form submitted:', { ...contactForm, siteId: id });
            toast.success('Your message has been sent! We will contact you soon.');
            setShowContactModal(false);
            setContactForm({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="site-detail-loading">
                <Container>
                    <div className="loading-spinner">
                        <Spinner animation="border" variant="primary" />
                        <p>Loading site details...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!site) {
        return (
            <Container>
                <Alert variant="danger" className="mt-4">
                    <h4>Site not found</h4>
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
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/catalog">Catalog</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{site.title}</span>
                </nav>

                <Row>
                    {/* Gallery */}
                    <Col lg={7}>
                        <div className="main-gallery">
                            <div className="main-image">
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
                            </div>

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
                    </Col>

                    {/* Site Info */}
                    <Col lg={5}>
                        <div className="site-info-card">
                            <div className="site-header">
                                {site.isFeatured && (
                                    <span className="featured-badge">Featured</span>
                                )}
                                <h1 className="site-title">{site.title}</h1>
                                <div className="site-price">
                                    ${site.price}<span>/month</span>
                                </div>
                            </div>

                            <p className="site-description">{site.description}</p>

                            <div className="site-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Category:</span>
                                    <span className="meta-value">{site.category}</span>
                                </div>
                                {site.demoUrl && (
                                    <div className="meta-item">
                                        <span className="meta-label">Live Demo:</span>
                                        <a
                                            href={site.demoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="demo-link"
                                        >
                                            View Live Site
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Technologies */}
                            {site.technologies && site.technologies.length > 0 && (
                                <div className="technologies-section">
                                    <h4>Technologies</h4>
                                    <div className="tech-tags">
                                        {site.technologies.map((tech, index) => (
                                            <span key={index} className="tech-tag">
                        {tech}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            {site.features && site.features.length > 0 && (
                                <div className="features-section">
                                    <h4>Key Features</h4>
                                    <ul className="features-list">
                                        {site.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <Button
                                    className="btn-rent-now"
                                    size="lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    Rent This Website
                                </Button>
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    variant="outline"
                                    className="btn-back-catalog"
                                >
                                    Back to Catalog
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Related Sites Section */}
                <RelatedSites currentSiteId={site._id} category={site.category} />
            </Container>

            {/* Contact Modal */}
            <Modal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                centered
                className="contact-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Rent {site.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleContactSubmit}>
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

                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={contactForm.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Message *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="message"
                                value={contactForm.message}
                                onChange={handleInputChange}
                                required
                                placeholder={`I'm interested in renting "${site.title}". Please provide more information about the rental process.`}
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
                                Submit Request
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
            <h2 className="section-title">Related Websites</h2>
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
                            </div>
                            <div className="related-site-info">
                                <h4>{site.title}</h4>
                                <p>${site.price}/month</p>
                                <Button
                                    as={Link}
                                    to={`/catalog/${site._id}`}
                                    size="sm"
                                    variant="outline"
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